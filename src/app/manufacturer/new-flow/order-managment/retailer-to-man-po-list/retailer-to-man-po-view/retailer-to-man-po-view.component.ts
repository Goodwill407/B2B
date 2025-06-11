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
  selector: 'app-retailer-to-man-po-view',
  standalone: true,
imports: [CommonModule, FormsModule, AccordionModule, TableModule],
  templateUrl: './retailer-to-man-po-view.component.html',
  styleUrl: './retailer-to-man-po-view.component.scss'
})
export class RetailerToManPoViewComponent {
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
  sgst: any
  igst: any
  cgst: any
  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

    /** ₹ amount saved by the % discount */
    discountAmount: number = 0;

    /** Subtotal after percentage discount */
    discountedTotal: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) 
  {
  }

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);

    this.getAllProducts();
  }
getAllProducts() {
  const url = `po-retailer-to-manufacture/${this.distributorId}`;
  this.authService.get(url).subscribe((res: any) => {
    this.responseData = res;
this.purchaseOrder = {
  poNumber: res.poNumber,
  poDate: new Date(res.retailerPoDate || res.retailerPoDate || Date.now()).toLocaleDateString(),

  manufacturerName: res.manufacturer?.companyName || '',
  manufacturerAddress: `${res.manufacturer?.address || ''}, ${res.manufacturer?.state || ''}`,
  manufacturerContact: res.manufacturer?.mobNumber || '',
  manufacturerEmail: res.manufacturer?.email || '',
  manufacturerGSTIN: res.manufacturer?.GSTIN || '',
  manufacturerPAN: res.manufacturer?.pan || '',

  retailerName: res.retailer?.companyName || '',
  retailerAddress: `${res.retailer?.address || ''}, ${res.retailer?.state || ''}`,
  retailerPhone: res.retailer?.mobNumber || '',
  retailerEmail: res.retailer?.email || '',
  retailerGSTIN: res.retailer?.GSTIN || '',
  retailerPAN: res.retailer?.pan || '',
  logoUrl: res.retailer?.logo || 'assets/images/company_logo.jpg',

  ProductDiscount: res.retailer?.productDiscount
    ? parseFloat(res.retailer.productDiscount)
    : 0,

  products: res.set || [],
};

    // ✅ Setup headers and pricing
    this.extractSizesAndPrices(res.set);

    // ✅ Get flat row structure
    this.mergedProducts = this.flattenProductData(res.set);
this.chunkArray(this.mergedProducts);

    // ✅ Recalculate totals
    this.Totalsub = this.mergedProducts.reduce((acc, item) => {
      const qty = this.getFirstQty(item.quantities);
      const price = this.getFirstPrice(item.quantities, item.designNumber);
      return acc + qty * price;
    }, 0);

    this.discountAmount = (this.Totalsub * this.purchaseOrder.ProductDiscount) / 100;
    this.discountedTotal = this.Totalsub - this.discountAmount;
    this.calculateGST();
  });
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

  tableChunks: any[][] = [];
serialOffset: number[] = [];

chunkArray(array: any[]): void {
  this.tableChunks = [];
  this.serialOffset = [];

  const firstChunkSize = 20;
  const nextChunkSize = 30;

  if (array.length > 0) {
    this.tableChunks.push(array.slice(0, firstChunkSize));
    this.serialOffset.push(0);

    let start = firstChunkSize;
    while (start < array.length) {
      this.tableChunks.push(array.slice(start, start + nextChunkSize));
      this.serialOffset.push(start);
      start += nextChunkSize;
    }
  }
}


  processGroupedProducts(productSet: any[]): any[] {
    interface Group { 
      designNumber: string;
      rows: { colourName: string; quantities: Record<string, number> }[];
      subTotal: number;
      discountedTotal: number;
      grandTotal: number;
    }
    const grouped: Record<string, Group> = {};
    let totalSub = 0, totalDiscounted = 0, grandSum = 0;
  
    //–– ① Group into per-design/colour buckets
    for (const p of productSet) {
      const key = p.designNumber;
      if (!grouped[key]) {
        grouped[key] = {
          designNumber: key,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
          grandTotal: 0
        };
      }
      let r = grouped[key].rows.find(r => r.colourName === p.colourName);
      if (!r) {
        r = { colourName: p.colourName, quantities: {} };
        grouped[key].rows.push(r);
      }
      r.quantities[p.size] = (r.quantities[p.size] || 0) + p.quantity;
    }
  
    //–– ② Compute subtotals & discounted totals
    for (const g of Object.values(grouped)) {
      // raw subTotal
      g.subTotal = g.rows.reduce((sum, r) => {
        return sum + this.sizeHeaders.reduce((s, sz) => {
          const qty = r.quantities[sz] || 0;
          return s + qty * (this.priceHeaders[sz] || 0);
        }, 0);
      }, 0);
  
      // discountedTotal = line-by-line with % discount
      g.discountedTotal = g.rows.reduce((sum, r) => {
        return sum + this.sizeHeaders.reduce((s, sz) => {
          const qty = r.quantities[sz] || 0;
          let line = qty * (this.priceHeaders[sz] || 0);
          const d = (line * this.purchaseOrder.ProductDiscount) / 100;
          return s + (line - d);
        }, 0);
      }, 0);
  
      totalSub += g.subTotal;
      totalDiscounted += g.discountedTotal;
    }
  
    //–– ③ overall discount & net
    this.Totalsub        = totalSub;
    this.discountAmount  = totalSub - totalDiscounted;
    this.discountedTotal = totalDiscounted;
  
    //–– ④ GST on the net total (normalize “MH” vs “Maharashtra”)
    this.calculateGST();
  
    //–– ⑤ per-group grandTotals & overall
    // for (const g of Object.values(grouped)) {
    //   g.grandTotal = g.discountedTotal + this.sgst + this.cgst + this.igst;
    //   grandSum += g.grandTotal;
    // }
    // this.totalGrandTotal = grandSum;
  
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
  let m = this.responseData.manufacturer.state?.trim().toLowerCase() || '';
  let r = this.responseData.retailer.state?.trim().toLowerCase()     || '';

  const same = m === r || m.includes(r) || r.includes(m);

  if (same) {
    this.sgst = (dt * 9) / 100;
    this.cgst = (dt * 9) / 100;
    this.igst = 0;
  } else {
    this.sgst = 0;
    this.cgst = 0;
    this.igst = (dt * 18) / 100;
  }

  this.totalGrandTotal = dt + this.sgst + this.cgst + this.igst;
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
  const fullId = 'purchase-order';
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const chunkCount = this.tableChunks.length || 1;  // fallback to 1 chunk
  let currentChunk = 0;

  const renderChunk = () => {
    const fullContent = document.getElementById(fullId);
    if (!fullContent) return;

    const fullClone = fullContent.cloneNode(true) as HTMLElement;

    // Hide all rows except for the current chunk
    const tableBody = fullClone.querySelector('p-table');
    const rows = fullClone.querySelectorAll('tbody tr');

    // Show all rows if chunking not enabled
    if (this.tableChunks.length > 0) {
      rows.forEach((row, i) => {
        const start = this.serialOffset[currentChunk];
        const end = start + this.tableChunks[currentChunk].length;
        if (i < start || i >= end) {
          (row as HTMLElement).style.display = 'none';
        }
      });
    }

    // Remove the page-header-content on next pages
    if (currentChunk > 0) {
      const headerContent = fullClone.querySelector('.page-header-content');
      if (headerContent) headerContent.remove();
    }

    // Copy styles
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((tag) => {
      fullClone.appendChild(tag.cloneNode(true));
    });

    // Temp container to render DOM off-screen
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
        renderChunk(); // Process next chunk
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

getFirstSize(quantities: any): string {
  return Object.keys(quantities)[0] || 'N/A';
}

getFirstQty(quantities: any): number {
  const size = this.getFirstSize(quantities);
  return quantities[size] || 0;
}

getFirstPrice(quantities: any, designNumber: string): number {
  const size = this.getFirstSize(quantities);
  return this.priceHeaders[size] || 0;
}


  
}
