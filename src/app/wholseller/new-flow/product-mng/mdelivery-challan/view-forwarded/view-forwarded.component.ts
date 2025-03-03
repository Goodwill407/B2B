
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-view-forwarded',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,       // PrimeNG Table
    PaginatorModule,   // PrimeNG Paginator
    RouterModule,      // For RouterLink to work
    BottomSideAdvertiseComponent,  // For bottom advertisement component
  ],
  templateUrl: './view-forwarded.component.html',
  styleUrl: './view-forwarded.component.scss'
})
export class ViewForwardedComponent implements OnInit {

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
  orderId: any ;
  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();
  }

  getAllProducts() {
    const url = `mnf-delivery-challan/purchase-orders/process-retailer-orders/forworded?orderId=${this.orderId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        console.log(res);

        this.purchaseOrder = {
          supplierName: res[0].fullName,
          supplierDetails: res[0].companyName,
          supplierAddress: `${res[0].companyName}`,
          supplierContact: 'N/A', // No contact in the response
          supplierGSTIN: 'GSTIN_NOT_PROVIDED',
          buyerName: res[0].fullName,
          logoUrl: '', // No logo in the response
          buyerAddress: 'N/A', // No address in the response
          buyerPhone: 'N/A', // No phone in the response
          buyerEmail: res[0].retailerEmail,
          buyerDetails: res[0].fullName,
          buyerGSTIN: 'GSTIN_NOT_PROVIDED',
          poDate: new Date().toLocaleDateString(),
          poNumber: res[0].poNumber,
          products: [],
        };

        // Flatten and process the products from the response data
        this.mergedProducts = this.flattenProductData(res);
        this.extractSizesAndPrices(res);
      },
      (error) => {
        console.error("Error fetching products", error);
      }
    );
  }

  forwardBtn() {
    this.authService.get(`/type2-purchaseorder/purchase-orders/update-quantities?orderId=${this.orderId}`).subscribe(
      (res: any) => {
        // this.tableData = res;  // Directly assign the result
        // this.totalResults = res.length;  // Since there's no totalResults field in your API response, assume it's the length of the data array.
        console.log(res);
      },
      (error) => {
        console.error('Error fetching data:', error);
        // Handle error (e.g., show a user-friendly message)
      }
    );
  }

  flattenProductData(responseData: any[]): any[] {
    const flattenedData: any[] = [];
    
    // Iterate over each order in the response data
    responseData.forEach((order) => {
      order.requestedItems.forEach((item:any) => {
        // Check if the item already exists in flattenedData by designNumber and colourName
        let existingRow = flattenedData.find(
          (row) => row.designNumber === item.designNumber && row.colourName === item.colourName
        );
        
        // If the item doesn't exist in flattenedData, create a new entry for it
        if (!existingRow) {
          existingRow = {
            poNumber: order.poNumber,
            statusOfOrder: order.status,
            companyName: order.companyName,
            designNumber: item.designNumber,
            colourName: item.colourName,
            colourImage: item.colour,  // Assuming the colour code can be used as the image URL
            quantities: {},  // Quantities ordered for each size
            availableQuantities: {}, // Quantities available for each size
            status: [], // Status of each size
          };
          flattenedData.push(existingRow);
        }
  
        // Add size-related data to the existing row
        existingRow.quantities[item.size] = item.orderedQuantity;
        existingRow.availableQuantities[item.size] = item.availableQuantity;
        existingRow.status.push({
          size: item.size,
          statusSingle: item.statusSingle || 'pending', // Default status is 'pending'
        });
  
        // Ensure that the size is included in the sizeHeaders if it’s not already there
        if (!this.sizeHeaders.includes(item.size)) {
          this.sizeHeaders.push(item.size);
        }
      });
    });
  
    return flattenedData;
  }
  

  extractSizesAndPrices(responseData: any[]) {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {}; // Reset size-price mapping

    responseData.forEach((order) => {
      order.requestedItems.forEach((product:any) => {
        if (product.size && product.orderedQuantity > 0) {
          uniqueSizes.add(product.size);
        }
      });
    });

    this.sizeHeaders = Array.from(uniqueSizes); // Convert Set to Array for the table header
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

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  addpo() {
    const url = `mnf-delivery-challan/purchase-orders/process-retailer-orders/forworded?orderId=${this.pono}`;
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

  updateStatusToChecked() {
    const payload = { status: 'checked', id: this.responseData[0]._id }; // Update the status for the first item
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

  // printPurchaseOrder(): void {
  //   const data = document.getElementById('purchase-order');
  //   if (data) {
  //     html2canvas(data, {
  //       scale: 3,
  //       useCORS: true,
  //     }).then((canvas) => {
  //       const imgWidth = 208;
  //       const pageHeight = 295;
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       let heightLeft = imgHeight;

  //       const contentDataURL = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //       const margin = 10;
  //       let position = margin;

  //       pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
  //       heightLeft -= pageHeight;

  //       while (heightLeft > 0) {
  //         pdf.addPage();
  //         position = margin - heightLeft;
  //         pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
  //         heightLeft -= pageHeight;
  //       }

  //       pdf.save('purchase-order.pdf');
  //     }).catch((error) => {
  //       console.error("Error generating PDF:", error);
  //     });
  //   } else {
  //     console.error("Element with id 'purchase-order' not found.");
  //   }
  // }
}
