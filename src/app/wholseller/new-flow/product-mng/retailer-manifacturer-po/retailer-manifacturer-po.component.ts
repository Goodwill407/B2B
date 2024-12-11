import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailer-manifacturer-po',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    AccordionModule
  ],
  templateUrl: './retailer-manifacturer-po.component.html',
  styleUrl: './retailer-manifacturer-po.component.scss'
})
export class RetailerManifacturerPoComponent {
  products: any[] = [];
  productssss: any[] = [];
  userProfile: any;
  filteredData: any;
  sizeHeaders: string[] = []; // To hold unique sizes dynamically
  priceHeaders: { [size: string]: number } = {}; 

  constructor(
    public authService: AuthService,
    public router: Router,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  // Fetch products from backend
  getAllProducts(email: string) {
    const url = `retailer-purchase-order-type2/purchase-orders/wholesaler-email/combined-order?wholesaleremail=${email}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res) {
          this.products = res;
          this.productssss = res;
          console.log(res)
          this.filteredData = this.products.find((product) => product.wholesaler.fullName);
          if (this.filteredData && Array.isArray(this.filteredData.set)) {
            this.extractSizesAndPrices(this.filteredData.set); // Extract sizes and prices
          } else {
            this.filteredData = { set: [] };
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Extract unique sizes and prices for each size
  extractSizesAndPrices(productSet: any[]): void {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {}; // Object to store size-price mapping
    
    productSet.forEach((product) => {
      if (product.size && product.price > 0) {  // Only add sizes with valid price > 0
        uniqueSizes.add(product.size);
        this.priceHeaders[product.size] = product.price; // Map size to its price
      }
    });

    this.sizeHeaders = Array.from(uniqueSizes); // Convert Set to Array for the table header
  }

  // Group products by design number and color, then aggregate quantities by size, 
  // and also calculate the Sub Total, GST, and Grand Total.
  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0; // Variable to keep track of the overall grand total
    let totalGST = 0; // Variable to accumulate GST across all groups
    let totalSub = 0; // Variable to accumulate Subtotal across all groups

    // Group products by design number and color
    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [], // Each row represents a color
          subTotal: 0, // Initialize subtotal for this design number
          gst: 0, // GST will be calculated later
          grandTotal: 0 // Grand total will be calculated later
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
          totalPrice: 0
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }

      // Update the quantity for each size
      existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;

      // Update the total price for this color row
      existingRow.totalPrice += product.quantity * product.price;
    });

    // Now calculate SubTotal, GST, and Grand Total for each group
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce((acc: number, row: any) => {
        return acc + this.calculateTotalPrice(row); // Add total price of each row in the group
      }, 0);

      // Calculate GST (18%)
      group.gst = this.calculateGST(group.subTotal);
      totalGST += group.gst; // Accumulate GST across all groups

      // Add to the totalSub (subtotal for the whole cart)
      totalSub += group.subTotal;

      // Calculate Grand Total (Sub Total + GST)
      group.grandTotal = this.calculateGrandTotal(group.subTotal, group.gst);

      // Add this group's grand total to the overall grand total
      totalGrandTotal += group.grandTotal;
    });

    // Set the totals for use in the template
    this.Totalsub = totalSub;
    this.gst = totalGST;
    this.totalGrandTotal = totalGrandTotal;

    return Object.values(groupedByDesignNumber);
  }

  // Calculate the total price for a specific row based on quantities and sizes
  calculateTotalPrice(row: any): number {
    let total = 0;

    // Loop through each size and calculate the price based on available quantities
    this.sizeHeaders.forEach(size => {
      if (row.quantities[size] > 0) {  // Check if there's a quantity for this size
        total += row.quantities[size] * (this.priceHeaders[size] || 0); 
        // Calculate price based on quantity and price for that size
      }
    });
    return total;
  }

  // Calculate GST (18%)
  calculateGST(subTotal: number): number {
    return (subTotal * 18) / 100; // 18% GST
  }

  // Calculate Grand Total (Sub Total + GST)
  calculateGrandTotal(subTotal: number, gst: number): number {
    return subTotal + gst;
  }

  // Place Order
  navigateToProduct(memail: string, wemail: string) {
    this.router.navigate(['/wholesaler/new/product/getmanpo'], {queryParams:{ memail: memail, wemail: wemail }});
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some(row => row.quantities[size] > 0);  // Check if any row has a quantity greater than 0 for the given size
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

  addpo() {
    const cartBody = { ...this.productssss };
  
    // Loop over each item in the array (this.productsss is already an array)
    this.productssss.forEach((item: any) => {
      // Here, 'item' is a single element of your array, no need for Object.values(res)
      const content = {
        set: item.set,
        email: item.email,
        cartAddedDate: item.cartAddedDate,
        manufacturer: item.manufacturer,
        poNumber: item.poNumber,
        productBy: item.productBy,
        retailerPOs: item.retailerPOs,
        wholesaler: item.wholesaler
      };
  
      // Send each content as a separate request
      this.authService.post('type2-purchaseorder', content).subscribe(
        (response) => {
          // Handle success for each item
          this.communicationService.customSuccess('Product Successfully Added in Cart');
        },
        (error) => {
          // Handle error for each request
          this.communicationService.customError1(error.error.message);
        }
      );
    });
  }
}
