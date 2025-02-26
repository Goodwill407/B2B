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
  selector: 'app-gen-performa-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule,RouterModule, TableModule],
  templateUrl: './gen-performa-invoice.component.html',
  styleUrl: './gen-performa-invoice.component.scss'
})
export class GenPerformaInvoiceComponent {
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

  orderedSet: any[] = [];  // Fixed data from API
avilableSet: any[] = []; // Editable copy of `orderedSet`
getAllProducts() {
  const url = `/perform-invoice/purchase-orders/old-availeble-data/${this.distributorId}`;

  this.authService.get(url).subscribe(
    (res: any) => {
      this.responseData = res;
      console.log("API Response:", res);

      if (res.set && Array.isArray(res.set) && res.set.length > 0) {
        this.extractSizesAndPrices(res.set);

        this.orderedSet = res.set.map((product: any) => ({
          designNumber: product.designNumber,
          colour: product.colour,
          colourImage: product.colourImage,
          colourName: product.colourName,
          size: product.size,
          quantity: product.quantity, // Original quantity
          price: product.price,
          productBy: res.manufacturer.email,
        }));

        // Store Available Data
        this.avilableSet = res.avilableSet.map((product: any) => ({ ...product }));

        // Process products and ensure quantities are patched
        this.mergedProducts = this.processGroupedProducts(res.set);
        this.patchAvailableQuantities();

        console.log("Merged Products (After Patching):", this.mergedProducts);
      }
    },
    (error) => {
      console.error("Error fetching purchase order data:", error);
    }
  );
  console.log("API Response:", this.responseData);
console.log("Ordered Set:", this.orderedSet);
console.log("Available Set (avilableSet):", this.avilableSet);

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
    const groupedProducts: { [key: string]: any } = {};
  
    productSet.forEach((product) => {
      const key = `${product.designNumber}-${product.colourName}`;
  
      if (!groupedProducts[key]) {
        groupedProducts[key] = {
          designNumber: product.designNumber,
          colourName: product.colourName,
          colourImage: product.colourImage,
          colour: product.colour,
          quantities: {},
          totalPrice: 0,
        };
      }
  
      // Store quantity per size
      if (product.size) {
        groupedProducts[key].quantities[product.size] =
          (groupedProducts[key].quantities[product.size] || 0) + product.quantity;
      }
    });
  
    return Object.values(groupedProducts);
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
console.log("Ordered Set (Fixed Data):", this.orderedSet);
console.log("Available Set (Editable Data):", this.avilableSet);
console.log("Retailer POs:", this.responseData.retailerPOs);

const payload = {
  email: this.responseData.wholesaler.email,
  productBy: this.responseData.manufacturer.email,
  poNumber: this.responseData.poNumber,
  deliveryChallanNumber: this.Deliverychllanid,
  orderedSet: this.orderedSet,  // Fixed (original) data
  avilableSet: this.avilableSet, // Modified (user-edited) data
  retailerPOs: this.responseData.retailerPOs, // ✅ Now sending retailer POs
  manufacturer: this.responseData.manufacturer,
  wholesaler: this.responseData.wholesaler,
};

console.log("Final Payload:", payload);

this.authService.post("mnf-delivery-challan", payload).subscribe(
  () => {
    this.communicationService.customSuccess("Product Successfully Added in Cart");
  },
  (error) => {
    this.communicationService.customError1(error.error.message);
  }
);
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
  console.log("Before Update:", JSON.stringify(this.avilableSet, null, 2));

  // Find the correct product in avilableSet that matches designNumber & size
  const productToUpdate = this.avilableSet.find(
    (p) =>
      p.designNumber === row.designNumber &&
      p.colourName === row.colourName &&
      p.size === size
  );

  if (productToUpdate) {
    productToUpdate.quantity = row.quantities[size]; // Update quantity
  } else {
    console.warn("Matching product not found for", row.designNumber, row.colourName, size);
  }

  console.log("After Update:", JSON.stringify(this.avilableSet, null, 2));
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
getOrderedQuantity(designNumber: string, colourName: string, size: string): number | null {
  const orderedItem = this.orderedSet.find(
    (item) => item.designNumber === designNumber && item.colourName === colourName && item.size === size
  );
  return orderedItem ? orderedItem.quantity : null;
}


patchAvailableQuantities(): void {
  this.mergedProducts.forEach((product) => {
    Object.keys(product.quantities).forEach((size) => {
      const availableItem = this.avilableSet.find(
        (item) =>
          item.designNumber === product.designNumber &&
          item.colourName === product.colourName &&
          item.size === size
      );

      if (availableItem) {
        product.quantities[size] = availableItem.quantity; // Patch available qty
      }
    });
  });
}


}

