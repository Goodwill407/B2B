import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IndianCurrencyPipe } from 'app/custom.pipe';
@Component({
  selector: 'app-view-place-order-po',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './view-place-order-po.component.html',
  styleUrl: './view-place-order-po.component.scss'
})
export class ViewPlaceOrderPoComponent {
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
    ProductDiscount: '',
  };

  mergedProducts: any[] = [];
  sgst: any
  igst: any
  cgst: any
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

  discountAmount: number = 0;

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
    this.distributorId = this.route.snapshot.queryParamMap.get('memail') ?? '';
    this.distributorId2 = this.route.snapshot.queryParamMap.get('wemail') ?? '';
    this.pono = this.route.snapshot.queryParamMap.get('poNumber') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();
  }

 getAllProducts() {
  const url = 'type2-purchaseorder/getsinglepurchaseorderdata/bywholesaleremail';
  const body = {
    email: this.distributorId2,
    productBy: this.distributorId,
    poNumber: parseInt(this.pono, 10)
  };

  this.authService.post(url, body).subscribe(
    (res: any) => {
      this.responseData = res;

      const productSet = res.set || [];

      // Assign data to purchaseOrder
      this.purchaseOrder = {
        supplierName: res.manufacturer.companyName,
        supplierDetails: res.manufacturer.fullName,
        supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state} `,
        supplierContact: `${res.manufacturer.mobNumber}`,
        supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
        buyerName: res.wholesaler.companyName,
        logoUrl: res.wholesaler.profileImg,
        buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.pinCode} - ${res.wholesaler.state} `,
        buyerPhone: res.wholesaler.mobNumber,
        buyerEmail: res.wholesaler.email,
        buyerDetails: res.wholesaler.fullName,
        buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
        poDate: new Date().toLocaleDateString(),
        poNumber: res.poNumber,
        products: productSet,
        ProductDiscount: parseFloat(res.wholesaler.productDiscount || '0'),
      };

      // Use direct flat table
      this.chunkArray(productSet);

      this.calculateTotalsFromRawData(productSet);
    },
    (error) => {
      console.error("Error fetching data:", error);
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
  this.totalGrandTotal = +(this.discountedTotal + this.sgst + this.cgst + this.igst).toFixed(2);
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
    const groupedByDesignNumber: Record<string, {
      designNumber: string;
      rows: { colourName: string; quantities: Record<string, number>; totalPrice: number }[];
      subTotal: number;
      discountedTotal: number;
      grandTotal: number;
    }> = {};
    
    let totalSub: number = 0;
    let totalDiscounted: number = 0;
    let totalGrandTotal: number = 0;
  
    // Step 1: Group products by design number
    productSet.forEach((product: any) => {
      const key = product.designNumber;
      if (!groupedByDesignNumber[key]) {
        groupedByDesignNumber[key] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
          grandTotal: 0,
        };
      }
  
      // Now the `r` below is explicitly typed
      let row = groupedByDesignNumber[key].rows.find((r: any) => 
        r.colourName === product.colourName
      );
  
      if (!row) {
        row = {
          colourName: product.colourName,
          quantities: {} as Record<string, number>,
          totalPrice: 0
        };
        groupedByDesignNumber[key].rows.push(row);
      }
  
      row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
      row.totalPrice += product.quantity * parseFloat(product.price);
    });
  
    // Step 2: Compute subtotals & discounted totals
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce(
        (sum: number, row: any) => sum + this.calculateTotalPrice(row, false),
        0
      );
  
      const discountAmt: number = (group.subTotal * this.purchaseOrder.ProductDiscount) / 100;
      group.discountedTotal = group.subTotal - discountAmt;
  
      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });
  
    // Store per-run totals
    this.discountAmount   = totalSub - totalDiscounted;
    this.Totalsub         = totalSub;
    this.discountedTotal  = totalDiscounted;
  
    // Step 3: GST on post-discount total
    this.calculateGST();  // sets this.sgst, this.cgst, this.igst
  
    // Step 4: Grand totals
    // Object.values(groupedByDesignNumber).forEach((group: any) => {
    //   group.grandTotal = group.discountedTotal + this.sgst + this.cgst + this.igst;
    //   totalGrandTotal += group.grandTotal;
    // });
    // this.totalGrandTotal = totalGrandTotal;
  
    return Object.values(groupedByDesignNumber);
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
  
    // Return the final calculated total price
    return total;
  }
  
  
  discountedTotal: number = 0;

  calculateGST(): void {
    const discountedTotal = this.discountedTotal;
  
    // Pull states directly from your response data
    const wholesalerState = this.responseData.manufacturer.state
      ?.trim()
      .toLowerCase();
    const retailerState = this.responseData.wholesaler.state
      ?.trim()
      .toLowerCase();
  
    if (wholesalerState && retailerState && wholesalerState === retailerState) {
      // Same state → SGST + CGST @ 9% each
      this.sgst = (discountedTotal * 9) / 100;
      this.cgst = (discountedTotal * 9) / 100;
      this.igst = 0;
    } else {
      // Different state (or missing data) → IGST @ 18%
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (discountedTotal * 18) / 100;
    }
  
    // Finally, update the grand total
    this.totalGrandTotal = (discountedTotal + this.sgst + this.cgst + this.igst).toFixed(2);
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

tableChunks: any[][] = [];
serialOffset: number[] = [];
chunkArray(array: any[]): void {
  this.tableChunks = [];
  this.serialOffset = [];

  const firstPage = 20; // items on first page
  const restPages = 30; // items on subsequent pages

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
        pdf.save('purchase-order.pdf');
      }
    });
  };

  renderChunk();
}

navigateFun(){
  this.location.back();
}
  
}
