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
    selector: 'app-gen-wholsaler-order-po',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule,RouterModule, TableModule],
    templateUrl: './gen-wholsaler-order-po.component.html',
    styleUrl: './gen-wholsaler-order-po.component.scss'
  })
  export class GenWholsalerOrderPoComponent {
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
    pendingQuantities: { [designNumber: string]: { [size: string]: number } } = {};
    mergedProducts: any[] = [];
    qty: any[] = [];
    mergedProducts2: any[] = [];
    quantityDifferences: { [key: string]: number } = {};
    responseData: any; // New variable to store response data
    distributorId: string = '';
    distributorId2: string = '';
    pono: string = '';
    products: any[] = [];
    userProfile: any;
    filteredData: any;
    Deliverychllanid: any;
    sizeHeaders: string[] = [];
    priceHeaders: { [size: string]: number } = {};

    totalGrandTotal: number = 0;
    gst: number = 0;
    Totalsub: number = 0;
  data: any;

    constructor(
      public authService: AuthService,
      
      private communicationService: CommunicationService,
      private route: ActivatedRoute
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
            logoUrl: this.authService.cdnPath + res.wholesaler.profileImg,
            buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
            buyerPhone: res.wholesaler.mobNumber,
            buyerEmail: res.wholesaler.email,
            buyerDetails: res.wholesaler.fullName,
            buyerDetails2: res.manufacturer.fullName,
            buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
            poDate: new Date().toLocaleDateString(),
            poNumber: res.poNumber,
            status: res.status,
            deliveryChallanNumber: this.Deliverychllanid,
            products: res.products || [],
            id: res.id,
          };
          const url2 = `mnf-delivery-challan/purchase-orders/genrate-chall-no?manufacturerEmail=${this.purchaseOrder.buyerEmail}`;
          this.authService.get(url2).subscribe(
            (res: any) => {
              console.log(res)
    this.Deliverychllanid = res.deliveryChallanNumber
            })

          if (res.set && Array.isArray(res.set) && res.set.length > 0) {
            this.extractSizesAndPrices(res.set); // <-- Ensure this is called
    
            // Process grouped products and update mergedProducts
            this.mergedProducts = this.processGroupedProducts(res.set);
            this.filteredData = res.set[0];
          
        
            // Proceed if filteredData is not empty
            if (this.filteredData) {
                // Flatten the set into mergedProducts
                this.mergedProducts = this.flattenProductData(res.set);  // Pass the entire set array
                this.mergedProducts2 = res.set;
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
    
        // Ensure that we are grouping by design number
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
            quantities: {}, // This holds quantities mapped by size
            totalPrice: 0,
          };
          groupedByDesignNumber[designKey].rows.push(existingRow);
        }
    
        // Update quantities by size for the respective color and design
        if (product.size && product.quantity) {
          existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
          existingRow.totalPrice += product.quantity * product.price;
        }
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
      
      // Iterate over the sizes and calculate total for that size
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

   // Function to update original data by subtracting updated quantity
calculateQuantities(original: any, updated: any) {
  return original.map((origItem: any) => {
    const matchingItem = updated.find(
      (updItem: any) =>
        origItem.designNumber === updItem.designNumber &&
        origItem.size === updItem.size &&
        origItem.colour === updItem.colour
    );

    if (matchingItem) {
      const updatedQuantity = origItem.quantity - matchingItem.quantity;
      return {
        ...origItem,
        quantity: updatedQuantity > 0 ? updatedQuantity : 0, // Avoid negative values
      };
    }

    return origItem; // If no match, keep original
  });
}

// addpo() {
//   console.log("Response Data:", this.responseData);
//   console.log("Merged Products:", this.mergedProducts);

//   // Interface for product structure
//   interface Product {
//     colour: string;
//     colourImage: string | null;
//     colourName: string;
//     designNumber: string;
//     price?: string;
//     totalPrice?: number;
//     productBy: string;
//     quantities: { [size: string]: number };
//   }

//   const productByEmail = this.responseData?.wholesaler?.email || "defaultEmail@example.com";

//   // Step 1: Prepare updatedProducts
//   const updatedProducts = this.mergedProducts
//     .map((product: Product) => {
//       const qty = product.quantities;

//       return Object.entries(qty).map(([size, quantity]) => {
//         const pendingQuantity = this.getPendingQuantity(product.designNumber, size);

//         const updatedQuantity = Math.max(quantity - pendingQuantity, 0); // Prevent negative quantity

//         return {
//           colour: product.colour,
//           colourImage: product.colourImage,
//           colourName: product.colourName,
//           designNumber: product.designNumber,
//           price: product.price || this.calculatePrice(product, qty),
//           productBy: productByEmail,
//           quantity: updatedQuantity,
//           size: size,
//         };
//       });
//     })
//     .flat();

//   console.log("Updated Data:", updatedProducts);

//   // Step 2: Calculate filtered data
//   const filteredData = this.calculateQuantities(this.mergedProducts2, updatedProducts);

//   // Step 3: Prepare payloads
//   const updatedCartBody = this.createPayload("proceed", updatedProducts);
//   const pendingCartBody = this.createPayload("pending", filteredData);

//   console.log("Updated Cart Body:", updatedCartBody);
//   console.log("Pending Cart Body:", pendingCartBody);

//   // Step 4: Send payloads to the backend
//   this.sendToBackend("mnf-delivery-challan", updatedCartBody, "Product Successfully Added in Cart");
//   this.sendToBackend("mnf-delivery-challan", pendingCartBody, "Pending Quantities Updated Successfully");
// }
addpo() {
  console.log("Response Data:", this.responseData);
  console.log("Merged Products:", this.mergedProducts);

  // Interface for product structure
  interface Product {
    colour: string;
    colourImage: string | null;
    colourName: string;
    designNumber: string;
    price?: string;
    totalPrice?: number;
    productBy: string;
    quantities: { [size: string]: number };
  }

  const productByEmail = this.responseData?.wholesaler?.email || "defaultEmail@example.com";

  // Step 1: Prepare updatedProducts
  const updatedProducts = this.mergedProducts
    .map((product: Product) => {
      const qty = product.quantities;

      return Object.entries(qty).map(([size, quantity]) => {
        const pendingQuantity = this.getPendingQuantity(product.designNumber, size);

        const updatedQuantity = Math.max(quantity - pendingQuantity, 0); // Prevent negative quantity

        return {
          colour: product.colour,
          colourImage: product.colourImage,
          colourName: product.colourName,
          designNumber: product.designNumber,
          price: product.price || this.calculatePrice(product, qty),
          productBy: productByEmail,
          quantity: updatedQuantity,
          size: size,
        };
      });
    })
    .flat();

  console.log("Updated Data:", updatedProducts);

  // Step 2: Calculate filtered data
  const filteredData = this.calculateQuantities(this.mergedProducts2, updatedProducts);

  // Check if there are any changes in quantity for pending cart
  const hasPendingChanges = filteredData.some(
    (item: any) => item.quantity !== this.getPendingQuantity(item.designNumber, item.size)
  );

  // Step 3: Prepare the proceed cart payload
  const updatedCartBody = this.createPayload("proceed", updatedProducts, this.Deliverychllanid);

  console.log("Updated Cart Body:", updatedCartBody);

  // Step 4: Send updated data to the backend
  this.sendToBackend("mnf-delivery-challan", updatedCartBody, "Product Successfully Added in Cart");

  // Step 5: Generate and send pending cart payload only if there are changes
  if (hasPendingChanges) {
    const pendingCartBody = this.createPayload("pending", filteredData , this.Deliverychllanid);
    console.log("Pending Cart Body:", pendingCartBody);

    this.sendToBackend(
      "mnf-delivery-challan",
      pendingCartBody,
      "Pending Quantities Updated Successfully"
    );
  } else {
    console.log("No pending quantity changes detected. Skipping pending cart generation.");
  }
}


// Function to calculate price per product
calculatePrice(product: any, quantities: { [key: string]: number }): string {
  return product.totalPrice
    ? (product.totalPrice / Object.keys(quantities).length).toString()
    : "0";
}

// Function to create payload with status
createPayload(status: string, setData: any, deliveryChallanNumber: any) {
  return {
    ...this.responseData,
    status,
    deliveryChallanNumber,
    set: setData,
  };
}

// Function to send data to the backend
sendToBackend(endpoint: string, payload: any, successMessage: string) {
  this.authService.post(endpoint, payload).subscribe(
    () => {
      this.communicationService.customSuccess(successMessage);
    },
    (error) => {
      this.communicationService.customError1(error.error.message);
    }
  );
}

// Function to get pending quantity
getPendingQuantity(designNumber: string, size: string): number {
  return this.pendingQuantities?.[designNumber]?.[size] || 0;
}

  // Example: Method to update `pendingQuantities` globally
  updatePendingQuantities(designNumber: string, size: string, quantity: number) {
      if (!this.pendingQuantities[designNumber]) {
          this.pendingQuantities[designNumber] = {};
      }
      this.pendingQuantities[designNumber][size] = quantity;
  }

    

    
    // Helper function to generate a unique ID (you can modify this if your backend uses a different ID generation strategy)
    generateUniqueId() {
      return 'id-' + Math.random().toString(36).substr(2, 9);
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

  onQuantityChange(row: any, size: string): void {
    const previousQuantity = row.previousQuantities ? row.previousQuantities[size] : 0;
    const newQuantity = row.quantities[size];

    // Calculate the difference
    const difference = newQuantity - previousQuantity;

    // Save the difference (you can also choose to store it in another structure if required)
    const key = `${row.designNumber}-${row.colourName}-${size}`;
    this.quantityDifferences[key] = difference;

    // Update previous quantities for future comparison
    if (!row.previousQuantities) {
      row.previousQuantities = {};
    }
    row.previousQuantities[size] = newQuantity;

    // Call update method to recalculate totals and any other actions
    this.updateTotals();
  }

  
  updateTotals(): void {
    this.Totalsub = this.mergedProducts.reduce((acc: number, group: any) => {
      return acc + group.rows.reduce((subAcc: number, row: any) => subAcc + this.calculateTotalPrice(row), 0);
    }, 0);
  
    this.gst = (this.Totalsub * 18) / 100; // 18% GST
    this.totalGrandTotal = this.Totalsub + this.gst;
  }
  
  updateMergedProducts(designNumber: string, colourName: string, size: string, newValue: number): void {
    const product = this.mergedProducts.find(item =>
      item.designNumber === designNumber &&
      item.colourName === colourName
    );
  
    if (product) {
      product.quantities[size] = newValue; // Update the size-specific quantity
      product.totalPrice = this.calculateTotalPrice(product); // Recalculate total price
      this.updateTotals(); // Recalculate overall totals
    }
  }


  }
