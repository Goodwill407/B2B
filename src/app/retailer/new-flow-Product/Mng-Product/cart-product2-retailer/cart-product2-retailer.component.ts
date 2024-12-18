import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-cart-product2-retailer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    AccordionModule
  ],
  templateUrl: './cart-product2-retailer.component.html',
  styleUrl: './cart-product2-retailer.component.scss'
})
export class CartProduct2RetailerComponent {
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  sizeHeaders: string[] = []; // To hold unique sizes dynamically
  priceHeaders: { [size: string]: number } = {}; 
  groupedByWholesaler: any[] = [];
  constructor(
    public authService: AuthService,
    private router: Router,
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
    const url = `retailer-cart-type2?email=${email}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res && res.results) {
          this.products = res.results;
          
          this.filteredData = this.products.find((product) => product.wholesaler.email);
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
  placeOrder(prod: any) {
    console.log(prod);

    // Ensure distributor and _id exist
    if (!prod || !prod._id) {
        console.error('No distributor ID found:', prod);
        return;
    }

    // Send the distributor ID to the OrderService if needed
    this.authService.setOrderData({ distributorId: prod._id });
    console.log(prod._id)

    // Navigate to the place-order page with the distributor ID as a route parameter
    this.router.navigate(['/retailer/new/poretailor', prod._id]);
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some(row => row.quantities[size] > 0);  // Check if any row has a quantity greater than 0 for the given size
  }

  groupProductsByWholesaler(products: any[]): void {
    const grouped: { [wholesalerEmail: string]: any } = {};

    products.forEach((product) => {
        const wholesalerEmail = product.wholesaler.email;
        const manufacturerId = product.manufacturerId; // Assuming manufacturerId is available

        if (!grouped[wholesalerEmail]) {
            grouped[wholesalerEmail] = {
                name: product.wholesaler.fullName,
                email: wholesalerEmail,
                manufacturers: {} // Nested grouping by manufacturer
            };
        }

        if (!grouped[wholesalerEmail].manufacturers[manufacturerId]) {
            grouped[wholesalerEmail].manufacturers[manufacturerId] = [];
        }

        grouped[wholesalerEmail].manufacturers[manufacturerId].push(product);
    });

    // Convert to array for iteration in the template
    this.groupedByWholesaler = Object.keys(grouped).map((key) => ({
        wholesaler: grouped[key],
        manufacturers: Object.keys(grouped[key].manufacturers).map((manKey) => ({
            manufacturerId: manKey,
            products: grouped[key].manufacturers[manKey]
        }))
    }));
}

}

