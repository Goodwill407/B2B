  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router';
  import { AuthService, CommunicationService } from '@core';
  import { AccordionModule } from 'primeng/accordion';
  import { TableModule } from 'primeng/table';
  interface Manufacturer {
    fullName: string;
    companyName: string;
    address: string;
    state: string;
    // Add any other fields you expect
  }
  
  // Define RetailerPO interface
  interface RetailerPO {
    email: string;
    poNumber: number;
  }
  
  // Define Wholesaler interface
  interface Wholesaler {
    email: string;
    fullName: string;
    companyName: string;
  }
  
  // Define the Item interface (each item in the response)
  interface Item {
    set: { _id: string, colourName: string }[];  // Array of set objects
    email: string;
    cartAddedDate: string;
    manufacturer: Manufacturer;
    poNumber: number;
    productBy: string;
    retailerPOs: RetailerPO[];
    wholesaler: Wholesaler;
  }
  
  // Define the ResponseData interface (response object is an object with keys like '0', '1')
  interface ResponseData {
    [key: string]: Item;  // This will allow dynamic keys like '0', '1', etc., with values of type Item
  }
  

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
    productsss: any[] = [];
    userProfile: any;
    mergedProducts: any[] = [];
    filteredData: any;
    sizeHeaders: string[] = []; // To hold unique sizes dynamically
    priceHeaders: { [size: string]: number } = {}; 
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
      const url = `retailer-purchase-order-type2/purchase-orders/wholesaler-email/combined-order?wholesaleremail=${email}`;
      this.authService.get(url).subscribe(
        (res: any) => {
          if (res && res) {
            this.products = res;
            this.productsss = res;
            console.log(this.products);
    
            // Loop through products and create purchaseOrder dynamically
            this.products.forEach(product => {
              const purchaseOrder = {
                supplierName: res.wholesaler.companyName,
                supplierDetails: res.wholesaler.fullName,
                supplierAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
                supplierContact: `${res.wholesaler.mobNumber}`,
                supplierGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
                buyerName: res.retailer.companyName,
                logoUrl: this.authService.cdnPath + res.retailer.profileImg,
                buyerAddress: `${res.retailer.address}, ${res.retailer.city}, ${res.retailer.state} - ${res.retailer.pinCode}`,
                buyerPhone: res.retailer.mobNumber,
                buyerEmail: res.retailer.email,
                buyerDetails: res.retailer.fullName,
                buyerGSTIN: res.retailer.GSTIN || 'GSTIN_NOT_PROVIDED',
                poDate: new Date().toLocaleDateString(),
                poNumber: res.poNumber,
                products: product.set || [],
              };
              console.log( product.purchaseOrder)
              product.purchaseOrder = purchaseOrder; // Attach purchaseOrder to product
            });
    
            if (res.set && Array.isArray(res.set) && res.set.length > 0) {
              this.extractSizesAndPrices(res.set);
              this.mergedProducts = this.processGroupedProducts(res.set);
              this.filteredData = res.set[0];
              
              if (this.filteredData) {
                this.mergedProducts = this.flattenProductData(res.set);
              }
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


  addpo() {
    const cartBody = { ...this.productsss };
  
    // Loop over each item in the array (this.productsss is already an array)
    this.productsss.forEach((item: any) => {
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
