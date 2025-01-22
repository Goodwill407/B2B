import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-view-wholesaler-po',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
  templateUrl: './view-wholesaler-po.component.html',
  styleUrl: './view-wholesaler-po.component.scss'
})
export class ViewWholesalerPoComponent {
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
    const url = `type2-purchaseorder/${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
       
        this.responseData = res; // Store the response in responseData
        console.log(res)
        // Update purchaseOrder from the response
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
          supplierContact: `${res.manufacturer.mobNumber}`,
          supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
          buyerName: res.wholesaler.companyName,
          logoUrl:res.wholesaler.profileImg,
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

        if (res.set && Array.isArray(res.set) && res.set.length > 0) {
          this.extractSizesAndPrices(res.set); // <-- Ensure this is called
  
          // Process grouped products and update mergedProducts
          this.mergedProducts = this.processGroupedProducts(res.set);
          this.filteredData = res.set[0];
        
      
          // Proceed if filteredData is not empty
          if (this.filteredData) {
              // Flatten the set into mergedProducts
              this.mergedProducts = this.flattenProductData(res.set);  // Pass the entire set array
              
          }
        }

       else {
          
          this.filteredData = null;
          this.mergedProducts = [];
      }
      
      
      },
      (error) => {
        
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

  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0;
    let totalGST = 0;
    let totalSub = 0;

    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          gst: 0,
          grandTotal: 0,
        };
      }

      let existingRow = groupedByDesignNumber[designKey].rows.find(
        (row: any) => row.colourName === product.colourName
      );

      if (!existingRow) {
        existingRow = {
          colourName: product.colourName,
          colourImage: product.colourImage,
          colour: product.colour,
          quantities: {},
          totalPrice: 0,
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }

      existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * product.price;
    });

    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row), 0);
      group.gst = this.calculateGST(group.subTotal);
      totalGST += group.gst;
      totalSub += group.subTotal;
      group.grandTotal = this.calculateGrandTotal(group.subTotal, group.gst);
      totalGrandTotal += group.grandTotal;
    });

    this.Totalsub = totalSub;
    this.gst = totalGST;
    this.totalGrandTotal = totalGrandTotal;

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
    const cartBody = { ...this.responseData }; // Create a copy of the response data
  
    delete cartBody._id;

  
    // Post the cleaned data to the backend
    this.authService.post('type2-purchaseorder', cartBody).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Product Successfully Added in Cart');
      },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    );
  }

  flattenProductData(productSet: any[]): any[] {
    const flatList: any[] = [];

    // Iterate through each product in the set
    productSet.forEach((product) => {
        const designKey = product.designNumber; // Assuming each product has a designNumber

        // Check if we already have a row for this designNumber + colourName
        let existingRow = flatList.find(row => row.designNumber === designKey && row.colourName === product.colourName);

        // If no existing row, create a new one
        if (!existingRow) {
            existingRow = {
                designNumber: product.designNumber,
                colourName: product.colourName,
                colourImage: product.colourImage,
                colour: product.colour,
                quantities: {},
                totalPrice: 0
            };
            flatList.push(existingRow);
        }

        // Update quantities for this specific size
        if (product.size && product.quantity) {
            existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
            existingRow.totalPrice += product.quantity * parseFloat(product.price); // Assuming price is a string
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

  
}
