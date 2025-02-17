import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-view-mdelivery-challan',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule
    ,  CommonModule,
    FormsModule,
    AccordionModule,
    TableModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './view-mdelivery-challan.component.html',
  styleUrl: './view-mdelivery-challan.component.scss'
})
export class ViewMdeliveryChallanComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    orderNo: 'PO123',
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
    totalInWords: '',
  };

  mergedProducts: any[] = [];
  isDialogVisible: boolean = false;
  selectedRow: any = null;
  selectedSize: string = '';
  feedback: string = '';
  
  responseData: any; // New variable to store response data
  distributorId: string = '';
  distributorId2: string = '';
  pono: string = '';
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
  ) 
  {
  }

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();
  }

  getAllProducts() {
    const url = `mnf-delivery-challan/${this.distributorId}`;
    this.authService.get(url).subscribe(
        (res: any) => {
            this.responseData = res;
            console.log(res);

            this.purchaseOrder = {
                supplierName: res.manufacturer.companyName,
                supplierDetails: res.manufacturer.fullName,
                supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
                supplierContact: `${res.manufacturer.mobNumber}`,
                supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
                buyerName: res.wholesaler.companyName,
                logoUrl: res.wholesaler.profileImg,
                buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
                buyerPhone: res.wholesaler.mobNumber,
                buyerEmail: res.wholesaler.email,
                buyerDetails: res.wholesaler.fullName,
                buyerDetails2: res.manufacturer.fullName,
                buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
                poDate: new Date().toLocaleDateString(),
                poNumber: res.poNumber,
                products: res.products || [],
            };

            // Ensure orderedSet and avilableSet are properly passed
            if (res.orderedSet && res.avilableSet) {
                this.extractSizesAndPrices(res.orderedSet);
                this.mergedProducts = this.processGroupedProducts(res.orderedSet, res.avilableSet);
            } else {
                this.mergedProducts = [];
            }
        },
        (error) => {
            console.error("Error fetching products", error);
        }
    );
}


  extractSizesAndPrices(productSet: any[]): void {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {}; // Reset size-price mapping

    productSet.forEach((product) => {
      if (product.size && product.price > 0) {
        uniqueSizes.add(product.size);
        this.priceHeaders[product.size] = product.price;
      }
    });

    this.sizeHeaders = Array.from(uniqueSizes); // Convert Set to Array for the table header
  }

  processGroupedProducts(orderedSet: any[], availableSet: any[]): any[] {
    const groupedByDesignNumber: any = {};

    orderedSet.forEach((product) => {
        const designKey = product.designNumber;

        if (!groupedByDesignNumber[designKey]) {
            groupedByDesignNumber[designKey] = {
                designNumber: product.designNumber,
                colourName: product.colourName,
                colourImage: product.colourImage,
                quantities: {},  // Store ordered quantities
                availableQuantities: {}, // Store available quantities
            };
        }

        // Assign ordered quantity
        groupedByDesignNumber[designKey].quantities[product.size] = product.quantity;

        // Find matching available quantity
        const matchingAvailable = availableSet.find(
            (avail) =>
                avail.designNumber === product.designNumber &&
                avail.size === product.size &&
                parseFloat(avail.price) === parseFloat(product.price)
        );

        groupedByDesignNumber[designKey].availableQuantities[product.size] =
            matchingAvailable ? matchingAvailable.quantity : 0;
    });

    console.log('Grouped Data:', Object.values(groupedByDesignNumber)); // ✅ Log final data before sending to UI
    return Object.values(groupedByDesignNumber);
}




  calculateTotalPrice(row: any): number {
    let total = 0;

    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    return total;
  }

  calculateGST(subTotal: number): number {
    return (subTotal * 18) / 100; // 18% GST
  }

  calculateGrandTotal(subTotal: number, gst: number): number {
    return subTotal + gst;
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  addpo() {
    const url = `/mnf-delivery-challan/purchase-orders/process-retailer-orders?deliveryChallanId=${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Accepted items processed successfully.');
        this.updateStatusToChecked(); // Call API to update status after successful processing
      },
      (error) => {
        this.communicationService.customError1('Failed to process accepted items.');
      }
    );
  }
  
  // Method to update the status to "checked"
  updateStatusToChecked() {
    // const url = ``,; // Use the `id` from the fetched data
    const payload = { status: 'checked', id:this.responseData.id }; // Payload to update the status
  
    this.authService.patch(`mnf-delivery-challan`, payload).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Status updated to checked successfully.');
        console.log('Updated Response:', res);
      },
      (error) => {
        this.communicationService.customError1('Failed to update status.');
        console.error('Error:', error);
      }
    );
  }
  
  
  
  
  
  
  

  flattenProductData(productSet: any[]): any[] {
    const flatList: any[] = [];
  
    productSet.forEach((product) => {
      const designKey = product.designNumber;
      let existingRow = flatList.find(
        (row) => row.designNumber === designKey && row.colourName === product.colourName
      );
  
      if (!existingRow) {
        existingRow = {
          designNumber: product.designNumber,
          colourName: product.colourName,
          colourImage: product.colourImage,
          quantities: {},
          accepted: {},
          defective: {},
          feedback: {}, // Add feedback field for each size
        };
        flatList.push(existingRow);
      }
  
      if (product.size && product.quantity) {
        existingRow.quantities[product.size] = product.quantity;
        existingRow.accepted[product.size] = product.quantity; // Default accepted to full quantity
        existingRow.defective[product.size] = 0; // Default defective to 0
        existingRow.feedback[product.size] = ''; // Initialize feedback for the size
      }
    });
  
    return flatList;
  }
  
  

printPurchaseOrder(): void {
  const data = document.getElementById('purchase-order');
  if (data) {
    html2canvas(data, {
      scale: 3,  // Adjust scale for better quality
      useCORS: true,
    }).then((canvas) => {
      const imgWidth = 208;  // A4 page width in mm
      const pageHeight = 295;  // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');  // Create new PDF
      const margin = 10;  // Margin for PDF
      let position = margin;

      // Add first page
      pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
      heightLeft -= pageHeight;

      // Loop over content to add remaining pages if content exceeds one page
      while (heightLeft > 0) {
        pdf.addPage();  // Add new page
        position = margin - heightLeft;  // Position for the next page
        pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF file
      pdf.save('purchase-order.pdf');
    }).catch((error) => {
      console.error("Error generating PDF:", error);
    });
  } else {
    console.error("Element with id 'purchase-order' not found.");
  }
}
onDefectiveChange(row: any, size: string): void {
  const totalQuantity = row.quantities[size] || 0;
  const defectiveQuantity = row.defective[size];

  // Ensure accepted quantity doesn't go below zero
  row.accepted[size] = Math.max(totalQuantity - defectiveQuantity, 0);

  if (defectiveQuantity < 0) {
    row.defective[size] = 0; // Reset to zero if negative
  }
}

openFeedbackDialog(row: any, size: string): void {
  this.selectedRow = row;
  this.selectedSize = size;
  this.feedback = row.feedback[size] || ''; // Loa  d existing feedback or initialize
  this.isDialogVisible = true; // Show the dialog
}
submitFeedback(): void {
  if (this.selectedRow) {
    // Store the returnReason in the specific size of the selected row
    this.selectedRow.feedback[this.selectedSize] = this.feedback;
    console.log('Feedback submitted:', {
      designNumber: this.selectedRow.designNumber,
      size: this.selectedSize,
      returnReason: this.feedback, // Rename feedback to returnReason
    });
  }

  // Clear feedback dialog inputs
  this.feedback = '';
  this.isDialogVisible = false;
}


processQuantitiesForResponses() {
  const defectiveResponse: any[] = [];
  const approvedResponse: any[] = [];

  // Iterate over the `mergedProducts`
  this.mergedProducts.forEach((row) => {
    this.sizeHeaders.forEach((size) => {
      const receivedQuantity = row.quantities[size] || 0; // Received quantity
      const defectiveQuantity = row.defective[size] || 0; // Defective quantity
      const approvedQuantity = Math.max(receivedQuantity - defectiveQuantity, 0); // Approved quantity
      const feedback = row.feedback[size] || ''; // Fetch feedback for the size

      // For defective response
      if (defectiveQuantity > 0) {
        defectiveResponse.push({
          designNumber: row.designNumber,
          colourName: row.colourName,
          size: size,
          defectiveQuantity: defectiveQuantity,
          feedback: feedback, // Add feedback to defective response
        });
      }

      // For approved response
      if (approvedQuantity > 0) {
        approvedResponse.push({
          designNumber: row.designNumber,
          colourName: row.colourName,
          size: size,
          approvedQuantity: approvedQuantity,
          feedback: feedback, // Optionally include feedback
        });
      }
    });
  });

  console.log('Defective Response:', defectiveResponse);
  console.log('Approved Response:', approvedResponse);

  return { defectiveResponse, approvedResponse };
}


submitResponses() {
  const { defectiveResponse, approvedResponse } = this.processQuantitiesForResponses();
console.log(defectiveResponse, approvedResponse)
  // Send defective response
  // this.authService.post('defective-api-endpoint', defectiveResponse).subscribe(
  //   (res: any) => {
  //     this.communicationService.customSuccess('Defective response submitted successfully.');
  //   },
  //   (error) => {
  //     this.communicationService.customError1('Failed to submit defective response.');
  //   }
  // );

  // Send approved response
  // this.authService.post('approved-api-endpoint', approvedResponse).subscribe(
  //   (res: any) => {
  //     this.communicationService.customSuccess('Approved response submitted successfully.');
  //   },
  //   (error) => {
  //     this.communicationService.customError1('Failed to submit approved response.');
  //   }
  // );
}


}
