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
  selector: 'app-retailor-po-gen',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './retailor-po-gen.component.html',
  styleUrl: './retailor-po-gen.component.scss'
})
export class RetailorPoGenComponent {
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
  distributorId: string;
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  ProductDiscount: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  sgst: any
  igst: any
  cgst: any

  discountAmount: number = 0;    // rupee savings
  discountedTotal: number = 0;   // net total after % discount

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
    const url = `po-retailer-to-wholesaler/${distributorId}`
    this.authService.get(url).subscribe(
      (res: any) => {
      
        this.responseData = res; // Store the response in responseData
        const productSet = res.set || [];
        console.log(this.responseData)
        // Update purchaseOrder from the response
        this.purchaseOrder = {
        supplierName: res.wholesaler.companyName,
        supplierAddress: `${res.wholesaler.address}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
        supplierContact: res.wholesaler.mobNumber,
        supplierEmail: res.wholesaler.email,
        supplierGSTIN: res.wholesaler.GSTIN || 'N/A',
        supplierPAN: res.wholesaler.PAN ?? res.wholesaler.GSTIN?.substring(2, 12) ?? 'N/A',

        buyerName: res.retailer.companyName,
        buyerAddress: `${res.retailer.address}, ${res.retailer.state} - ${res.retailer.pinCode}`,
        buyerPhone: res.retailer.mobNumber,
        buyerEmail: res.retailer.email,
        buyerGSTIN: res.retailer.GSTIN || 'N/A',
        buyerPAN: res.retailer.PAN ?? res.retailer.GSTIN?.substring(2, 12) ?? 'N/A',
        
        logoUrl: res.retailer.logo ?? 'assets/images/company_logo.jpg',
        poDate: new Date(res.retailerPoDate).toLocaleDateString(),
        poNumber: res.poNumber,
        products: res.set || [],
        ProductDiscount: parseFloat(res.retailer.productDiscount ?? '0'),
      };


      // Use direct flat table
      this.chunkArray(productSet);

      this.calculateTotalsFromRawData(productSet);
      
      
      },
      (error) => {
        
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
  
    // 1 Group by designNumber + colourName
    productSet.forEach(p => {
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
      let row = grouped[key].rows.find(r => r.colourName === p.colourName);
      if (!row) {
        row = { colourName: p.colourName, quantities: {} };
        grouped[key].rows.push(row);
      }
      row.quantities[p.size] = (row.quantities[p.size] || 0) + p.quantity;
    });
  
    // 2 Compute subtotals & discounted totals
    Object.values(grouped).forEach(group => {
      group.subTotal = group.rows.reduce(
        (sum, r) => sum + this.calculateTotalPrice(r, false),
        0
      );
      group.discountedTotal = group.rows.reduce(
        (sum, r) => sum + this.calculateTotalPrice(r, true),
        0
      );
      totalSub        += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });
  
    // 3 Store rupee‐discount and net total
    this.discountAmount   = totalSub - totalDiscounted;
    this.Totalsub         = totalSub;
    this.discountedTotal  = totalDiscounted;
  
    // 4 Recompute GST on the net total
    this.calculateGST();  // sets this.sgst, this.cgst, this.igst
  
    // 5 Compute grand totals
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
  
    // Return the final calculated total price
    return total;
  }
  
    

  calculateGST(): void {
    const dt = this.discountedTotal;
    const manuState = this.responseData.wholesaler.state?.trim().toLowerCase();
    const retState  = this.responseData.retailer.state?.trim().toLowerCase();
    console.log(manuState);
    console.log(retState,"ret state")
    if (manuState && retState && manuState === retState) {
      // intra-state → SGST + CGST @9%
      this.sgst = (dt *  9) / 100;
      this.cgst = (dt *  9) / 100;
      this.igst = 0;
    } else {
      // inter-state → IGST @18%
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (dt * 18) / 100;
    }
    this.totalGrandTotal = dt + this.sgst + this.cgst + this.igst;
  }
  
  
  
  
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
    const cartBody = { ...this.responseData };
    // Create a copy of the response data
  
    // Remove unwanted fields
    delete cartBody.__v;
    delete cartBody._id;
    delete cartBody.productId;
    // if (cartBody.set && Array.isArray(cartBody.set)) {
    //   cartBody.set.forEach((product: any) => {
    //     product.productBy = this.responseData.productBy; // Add productBy to each product in the set
    //   });
    // }
  
    // Post the cleaned data to the backend
    this.authService.post('retailer-purchase-order-type2', cartBody).subscribe(
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

