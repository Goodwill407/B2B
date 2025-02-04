import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-wholesaler-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // NgStyle,
    RouterModule,
    TableModule,
    AccordionModule,
    DatePipe
  ],
  templateUrl: './wholesaler-order-list.component.html',
  styleUrl: './wholesaler-order-list.component.scss'
})
export class WholesalerOrderListComponent {

  products: any[] = [];
  filteredData: any;
  priceHeaders: any;
  sizeHeaders: any[] = [];
  userProfile: any;
  transportTypes: any = ['By Air', 'By Ship', 'By Road', 'By Courier'];
  courierCompanies: any = ['FedEx', 'Delhivery', 'BlueDart', 'DHL', 'Shadowfax', 'Aramex Logistics Services', 'India Post', 'DTDC Courier'];

  constructor(public authService: AuthService, private router: Router, private communicationService: CommunicationService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
    this.getCouriersCompany();
    // this.postCourierCompany({name:'FedEx'})
  }



  getCouriersCompany() {
    this.authService.get('courier').subscribe((data) => {
      this.courierCompanies = data.results;
    })
  }

  postCourierCompany(data: any) {
    this.authService.post('courier', data).subscribe((data) => {
      console.log(data);
    })
  }

  updateDeliveryQuantity(event: any, distributor: any, product: any): void {
    const deliveryQuantity = event.target.value;
    product.deliveryQty = deliveryQuantity;
    this.updateTotals(distributor);
    this.cd.detectChanges();
  }

  updateTotals(distributor: any): void {
    distributor.subTotal = distributor.products.reduce((sum: number, product: any) => sum + (product.deliveryQty * product.rate), 0);
    // Check if discount is defined and is an array
    if (Array.isArray(distributor.discounts) && distributor.discounts.length > 0) {
      const discountPercentage = Number(distributor.discounts[0].productDiscount.replace('%', '')) / 100;
      distributor.discount = (distributor.subTotal * discountPercentage).toFixed(2);
    } else {
      distributor.discount = 0;
    }

    distributor.gst = Number((distributor.subTotal * 0.18).toFixed(2));
    distributor.grandTotal = (distributor.subTotal - distributor.discount) + Number(distributor.gst);
  }

  onTransportTypeChange(distributor: any): void {
    // Reset dependent fields when transport type changes
    distributor.transportCompany = '';
    distributor.lorryReceiptNo = '';
    distributor.vehicleNo = '';
    distributor.receiptNo = '';
    distributor.courierCompany = '';
    distributor.otherCompanyName = '';
  }

  validateShippingDetails(distributor: any): boolean {
    let isValid = true;

    if (!distributor.transportType) {
      isValid = false;
      this.communicationService.showNotification('snackbar-dark', 'Please select a transport type.', 'bottom', 'center')
    } else if (distributor.transportType === 'By Road') {
      if (!distributor.transportCompany || !distributor.lorryReceiptNo || !distributor.vehicleNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "By Road".', 'bottom', 'center')
      }
    } else if (distributor.transportType === 'By Air' || distributor.transportType === 'By Ship') {
      if (!distributor.transportCompany || !distributor.receiptNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "Company " or "Receipt No".', 'bottom', 'center')
      }
    } else if (distributor.transportType === 'By Courier') {
      if (!distributor.courierCompany || (!distributor.otherCompanyName && distributor.courierCompany === 'Other') || !distributor.trackingNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "By Courier".', 'bottom', 'center')
      }
    }

    return isValid;
  }

  deliveryChallan(obj: any) {
    if (this.validateShippingDetails(obj)) {
      const serializedProduct = JSON.stringify(obj);
      this.router.navigate(['/mnf/delivery-challan'], {
        queryParams: { product: serializedProduct, email: this.userProfile.email }
      });
    }
  }

  onCourierCompanyChange(distributor: any): void {
    if (distributor.courierCompany !== 'Other') {
      distributor.otherCompanyName = '';
    }
  }

  addOtherCompany(companyName: string): void {
    if (companyName && !this.courierCompanies.includes(companyName)) {
      this.postCourierCompany({ name: companyName });
    }
  }


  ///  coyed component 

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  // Fetch products from backend
  getAllProducts(email: string) {
    const url = `type2-purchaseorder/getby/supplier?supplierEmail=${email}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res ) {
          this.products = res;
          this.filteredData = this.products.find((product) => product.manufacturer.fullName);
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

    // Navigate to the place-order page with the distributor ID as a route parameter
    this.router.navigate(['wholesaler/new/product/viewpo', prod._id]);
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some(row => row.quantities[size] > 0);  // Check if any row has a quantity greater than 0 for the given size
  }

}

