  import { CommonModule, Location } from '@angular/common';
  import { Component, OnInit } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { ActivatedRoute, Router, RouterModule } from '@angular/router';
  import { AuthService, CommunicationService } from '@core';
  import { AccordionModule } from 'primeng/accordion';
  import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
  @Component({
    selector: 'app-genratepo',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule, TableModule],
    templateUrl: './genratepo.component.html',
    styleUrls: ['./genratepo.component.scss'],
  })
  export class GenratepoComponent implements OnInit {
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
      ProductDiscount:'',
    };

    mergedProducts: any[] = [];
    sgst: number = 0;
    igst: number = 0;
    cgst: number = 0;
    responseData: any; // New variable to store response data
    distributorId: string;
    products: any[] = [];
    userProfile: any;
    filteredData: any;
    sizeHeaders: string[] = [];
    priceHeaders: { [size: string]: number } = {};

    discountAmount: number = 0;     // ₹ value of the discount
    discountedTotal: number = 0;    // net total after discount

    totalGrandTotal: number = 0;
    gst: number = 0;
    Totalsub: number = 0;

    constructor(
      public authService: AuthService,
      private router: Router,
      private communicationService: CommunicationService,
      private route: ActivatedRoute,
      private location: Location
    ) {
      this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
   
    }

    ngOnInit(): void {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.getAllProducts(this.distributorId);
    
    }
getAllProducts(distributorId: string) {
  const url = `type2-cart/place-order/products/${distributorId}`;
  this.authService.get(url).subscribe(
    (res: any) => {
      console.log('✅ Full API response:', res);

      // Extract product set (actual cart items)
      const productSet = res.set || [];

      // Store full response in a local variable
      this.responseData = res;

      // Assign PO details and product list properly
      this.purchaseOrder = {
        supplierName: res.manufacturer.companyName,
        supplierDetails: res.manufacturer.fullName,
        supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
        supplierContact: res.manufacturer.mobNumber,
        supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',

        buyerName: res.wholesaler.companyName,
        buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
        buyerPhone: res.wholesaler.mobNumber,
        buyerEmail: res.wholesaler.email,
        buyerDetails: res.wholesaler.fullName,
        buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
        logoUrl: res.wholesaler.profileImg || '',

        poDate: new Date().toLocaleDateString(),
        poNumber: res.poNumber,

        products: productSet,  // ✅ Assign actual product data here
        ProductDiscount: res.wholesaler.productDiscount !== undefined && res.wholesaler.productDiscount !== ''
          ? parseFloat(res.wholesaler.productDiscount)
          : 0,
      };

      // ✅ Proceed with calculations and table rendering
      this.calculateTotalsFromRawData(productSet);         // flat table version
      this.extractSizesAndPrices(productSet);              // if needed
      this.chunkArray(productSet);                         // if using chunked PDF export
    },
    (error) => {
      console.error('❌ Error fetching products:', error);
      this.communicationService.customError1('Failed to load purchase order data.');
    }
  );
}

calculateTotalsFromRawData(productSet: any[]): void {
  let subtotal = 0;

  productSet.forEach((item) => {
    const quantity = item.quantity || 0;
    const rate = parseFloat(item.price) || 0;
    subtotal += quantity * rate;
  });

  this.Totalsub = subtotal;

  const discount = this.purchaseOrder.ProductDiscount || 0;
  const discountAmount = (subtotal * discount) / 100;
  this.discountAmount = discountAmount;
  this.discountedTotal = subtotal - discountAmount;

  this.calculateGST();
  this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
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
      const grouped: Record<string, {
        designNumber: string;
        rows: { colourName: string; quantities: Record<string, number> }[];
        subTotal: number;
        discountedTotal: number;
        grandTotal: number;
      }> = {};
    
      let totalSub = 0;
      let totalDiscounted = 0;
      let totalGrandTotal = 0;
    
      // Build groups by designNumber + colourName
      productSet.forEach(product => {
        const key = product.designNumber;
        if (!grouped[key]) {
          grouped[key] = { designNumber: key, rows: [], subTotal: 0, discountedTotal: 0, grandTotal: 0 };
        }
        let row = grouped[key].rows.find(r => r.colourName === product.colourName);
        if (!row) {
          row = { colourName: product.colourName, quantities: {} };
          grouped[key].rows.push(row);
        }
        row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
      });
    
      // Compute subtotals and discounted totals
      Object.values(grouped).forEach(group => {
        group.subTotal = group.rows.reduce(
          (sum, row) => sum + this.calculateTotalPrice(row, false),
          0
        );
        group.discountedTotal = group.rows.reduce(
          (sum, row) => sum + this.calculateTotalPrice(row, true),
          0
        );
        totalSub        += group.subTotal;
        totalDiscounted += group.discountedTotal;
      });
    
      // Store overall discount & post-discount subtotal
      this.discountAmount  = totalSub - totalDiscounted;
      this.Totalsub        = totalSub;
      this.discountedTotal = totalDiscounted;
    
      // Recompute GST on the post-discount total
      this.calculateGST();
    
      // Compute grand totals
      // Object.values(grouped).forEach(group => {
      //   group.grandTotal = group.discountedTotal + this.sgst + this.cgst + this.igst;
      //   totalGrandTotal += group.grandTotal;
      // });
      // this.totalGrandTotal = totalGrandTotal;
    
      return Object.values(grouped);
    }
    
    
    calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
      let total = 0;
    
      // Loop through each size header and calculate the total price
      this.sizeHeaders.forEach((size) => {
        // If there is a quantity for the current size, add to the total
        if (row.quantities[size] > 0) {
          total += row.quantities[size] * (this.priceHeaders[size] || 0);
        }
      });
    
      // Apply the discount if flag is true and discount is greater than 0
      if (applyDiscount && this.purchaseOrder.ProductDiscount > 0) {
        const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
        total -= discount;
      }
    
      // Return the final calculated total price (round to 2 decimal places for consistency)
      return parseFloat(total.toFixed(2));  // Optional: rounds off the value to 2 decimal points
    }
    
    
    

    calculateGST(): void {
      const dt = this.discountedTotal;
    
      const manuState = this.responseData.manufacturer.state?.trim().toLowerCase();
      const whoState  = this.responseData.wholesaler.state?.trim().toLowerCase();
    
      if (manuState && whoState && manuState === whoState) {
        // intra-state
        this.sgst = (dt * 9) / 100;
        this.cgst = (dt * 9) / 100;
        this.igst = 0;
      } else {
        // inter-state
        this.sgst = 0;
        this.cgst = 0;
        this.igst = (dt * 18) / 100;
      }
    
      this.totalGrandTotal = +(dt + this.sgst + this.cgst + this.igst).toFixed(2);
    }
    
    
    
    getStateFromAddress(address: string): string | null {
      if (!address) {
        console.error('Address is empty or invalid:', address);
        return null;  // Address is missing or invalid
      }
    
      console.log('Address:', address);  // Debug the address string
    
      // Split the address by commas to separate the components
      const addressParts = address.split(',');
    
      console.log('Address Parts:', addressParts);  // Log the parts for debugging
    
      // If there are at least two parts, assume the second to last part is the state
      if (addressParts.length >= 2) {
        const state = addressParts[addressParts.length - 1]?.trim();  // Second last part should be the state
    
        // Ensure that the state is a valid non-numeric string
        if (state && isNaN(parseInt(state))) {
          return state;
        } else {
          console.error('Invalid state detected:', state);
        }
      }
    
      // If state is missing or invalid, return null
      return null;
    } 
    dicountprice: number = 0;
    calculateDiscountedTotal(subTotal: number): number {
      // Apply discount (for example, 2% in this case)
      const discount = (subTotal * 2) / 100;
      const discountedTotal = subTotal - discount;
    
      // Store discount for display
      this.dicountprice = discount;  
    
      return discountedTotal;
    }
    

    calculateGrandTotal(subTotal: number, discount: number, igst: number): number {
      const discountedSubtotal = subTotal - discount;
      const igstAmount = (discountedSubtotal * igst) / 100;  // Apply 18% IGST
      return discountedSubtotal + igstAmount;
    }

    isSizeAvailable(rows: any[], size: string): boolean {
      return rows.some((row) => row.quantities[size] > 0);
    }
    addpo() {
      const cartBody = { ...this.responseData }; // Create a copy of the response data
    
      // Remove unwanted fields
      delete cartBody.__v;
      delete cartBody._id;
      delete cartBody.productId;
    
      // Post the cleaned data to the backend
      this.authService.post('type2-purchaseorder', cartBody).subscribe(
        (res: any) => {
          this.communicationService.customSuccess('Purchace Order Genrated Succesfully');
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

  tableChunks: any[][] = [];
serialOffset: number[] = [];

chunkArray(array: any[]): void {
  this.tableChunks = [];
  this.serialOffset = [];

  const firstPage = 20; // first page item limit
  const restPages = 30; // subsequent page item limit

  if (array.length <= firstPage) {
    this.tableChunks.push(array);
    this.serialOffset.push(0);
  } else {
    this.tableChunks.push(array.slice(0, firstPage));
    this.serialOffset.push(0);

    let start = firstPage;
    while (start < array.length) {
      this.tableChunks.push(array.slice(start, start + restPages));
      this.serialOffset.push(start);
      start += restPages;
    }
  }
}

  
 printPO(): void {
  const fullId = 'purchase-order';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const chunkCount = this.tableChunks.length;
  let currentChunk = 0;

  const renderChunk = () => {
    const fullContent = document.getElementById(fullId);
    if (!fullContent) return;

    const fullClone = fullContent.cloneNode(true) as HTMLElement;

    // ✅ Hide all table chunks except current one
    const chunks = fullClone.querySelectorAll('.table-chunk');
    chunks.forEach((div, i) => {
      (div as HTMLElement).style.display = i === currentChunk ? 'block' : 'none';
    });

    // ✅ Remove the header on all pages after the first
    if (currentChunk > 0) {
      const header = fullClone.querySelector('#purchase-header');
      if (header) header.remove();
    }

    const tempWrapper = document.createElement('div');
    tempWrapper.style.position = 'fixed';
    tempWrapper.style.top = '-10000px';
    tempWrapper.style.left = '-10000px';
    tempWrapper.style.width = '1000px';
    tempWrapper.style.zIndex = '-9999';
    tempWrapper.style.opacity = '0';
    tempWrapper.appendChild(fullClone);
    document.body.appendChild(tempWrapper);

    html2canvas(fullClone, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      if (currentChunk > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

      document.body.removeChild(tempWrapper);

      currentChunk++;
      if (currentChunk < chunkCount) {
        renderChunk();
      } else {
   const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
const poNumber = this.purchaseOrder.poNumber || 'no-number';
pdf.save(`PO_${poDate}_${poNumber}.pdf`);
      }
    });
  };

  renderChunk();
}



  navigateFun() {
    this.location.back();
  }

  }
