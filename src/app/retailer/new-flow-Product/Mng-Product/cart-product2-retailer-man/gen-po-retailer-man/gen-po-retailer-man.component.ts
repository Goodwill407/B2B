import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';

@Component({
  selector: 'app-gen-po-retailer-man',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './gen-po-retailer-man.component.html',
  styleUrl: './gen-po-retailer-man.component.scss'
})
export class GenPoRetailerManComponent {
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

  email1: string;
  productby1: string;
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

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.email1 = this.route.snapshot.paramMap.get('email') ?? '';
    this.productby1 = this.route.snapshot.paramMap.get('productBy') ?? '';

  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.email1,this.productby1);



  }

getAllProducts(email1: string, productby1: string) {
  const url = `rtl-toMnf-cart/cart-products/po?email=${email1}&productBy=${productby1}`;
  this.authService.get(url).subscribe(
    (res: any) => {
      this.responseData = res;
      console.log('📦 Raw Response:', res);


      const productSet = res.products?.[0]?.set || [];
this.chunkArray(productSet);

      // ✅ Populate purchaseOrder without processing/merging data
      this.purchaseOrder = {
        supplierName: res.manufacturer.companyName || '',
        supplierDetails: res.manufacturer.fullName || '',
        supplierAddress: `${res.manufacturer.address || ''} ${res.manufacturer.city || ''}  ${res.manufacturer.pinCode || ''} ${res.manufacturer.state || ''}`,
        supplierContact: res.manufacturer.mobNumber || '',
        supplierGSTIN: res.manufacturer.GSTIN || '',
        supplierEmail: res.manufacturer.email || '',
        supplierPAN: res.manufacturer.pan || '',
        buyerName: res.retailer.companyName || '',
        buyerDetails: res.retailer.fullName || '',
        buyerEmail: res.retailer.email || '',
        buyerAddress: `${res.retailer.address || ''} ${res.retailer.city || ''}  ${res.retailer.pinCode || ''} ${res.retailer.state || ''}`,
        buyerPhone: res.retailer.mobNumber || '',
        buyerGSTIN: res.retailer.GSTIN || '',
        buyerPAN: res.retailer.pan || '',
        logoUrl: res.retailer.profileImg || 'assets/images/company_logo.jpg',
        orderDate: new Date().toLocaleDateString(),
        poDate: new Date().toLocaleDateString(),
        orderNumber: res.orderNumber || '',
        products: productSet,
        ProductDiscount: res.retailer.productDiscount || 0
      };

      // ✅ Store unprocessed product data
      this.products = productSet;

      // ✅ Extract size/price for footer summary calculations
      this.extractSizesAndPrices(productSet);

      // ✅ Chunk the original data (used only for PDF)
    this.chunkArray(productSet);
 // or whatever your full data list is

      // ✅ Calculate totals directly
      this.calculateTotalsFromRawData(productSet);
    },
    (error) => {
      console.error("Error fetching products:", error);
    }
  );
}
calculateTotalsFromRawData(productSet: any[]) {
  let subtotal = 0;

  productSet.forEach((item) => {
    const quantity = item.quantity || 0;
    const rate = parseFloat(item.price) || 0;
    subtotal += quantity * rate;
  });

  this.Totalsub = subtotal;

  const discount = this.purchaseOrder.ProductDiscount || 0;
  const discountAmount = (subtotal * discount) / 100;
  this.discountedTotal = subtotal - discountAmount;
  this.dicountprice = discountAmount;

  this.calculateGST(); // already uses discountedTotal

  this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
}

    
  navigateFun() {
    this.location.back();
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

  discountedTotal: number = 0; // Add this property

  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0;
    let totalSub = 0;
    let totalDiscounted = 0;
    
    // Step 1: Group products by design number
    productSet.forEach((product) => {
      const designKey = product.designNumber;
      
      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
          grandTotal: 0,
        };
      }
  
      let existingRow = groupedByDesignNumber[designKey].rows.find(
        (row: any) => row.colourName === product.colourName
      );
  
      if (!existingRow) {
        existingRow = {
          colourName: product.colourName,
          quantities: {},
          totalPrice: 0,
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }
  
      existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * product.price;
    });
  
    // Step 2: Calculate totals for all products
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, false), 0);
      group.discountedTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, true), 0);
  
      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });
  
    // Step 3: Calculate GST based on the total discounted value (not per product)
    this.discountedTotal = totalDiscounted;  // Use final discounted total for all products
    this.calculateGST();  // Calculate GST based on the final discounted total
  
    // Step 4: Calculate the Grand Total (without double-counting GST)
    totalGrandTotal = totalDiscounted + this.igst;  // Don't add GST twice
  
    // Store the final totals
    this.Totalsub = totalSub;
    this.totalGrandTotal = parseFloat(totalGrandTotal.toFixed(2));  // Round to two decimal places
  
    console.log('Subtotal:', totalSub);
    console.log('Total Discounted:', totalDiscounted);  // This should be the final discounted total
    console.log('GST (SGST, CGST, IGST):', this.sgst, this.cgst, this.igst);
    console.log('Grand Total:', this.totalGrandTotal);
    
    return Object.values(groupedByDesignNumber);
  }
  
  
  
  
  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;
    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });
    if (applyDiscount && this.purchaseOrder.ProductDiscount && this.purchaseOrder.ProductDiscount > 0) {
      const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
      total -= discount;
    }
    return total;
  }
  
  
    

calculateGST() {
  const discountedTotal = this.discountedTotal;

  // ✅ Use clean state values from response instead of parsing addresses
  const retailerState = this.responseData?.retailer?.state?.trim().toLowerCase();
  const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();

  if (retailerState && supplierState) {
    if (retailerState === supplierState) {
      this.sgst = (discountedTotal * 9) / 100;
      this.cgst = (discountedTotal * 9) / 100;
      this.igst = 0;
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (discountedTotal * 18) / 100;
    }
  } else {
    // Fallback: treat as IGST if we can't compare properly
    this.sgst = 0;
    this.cgst = 0;
    this.igst = (discountedTotal * 18) / 100;
  }

  this.totalGrandTotal = parseFloat((discountedTotal + this.sgst + this.cgst + this.igst).toFixed(2));
}

  
  
  
  
  
  calculateDiscountedTotal(subTotal: number): number {
    // Apply discount (for example, 2% in this case)
    const discount = (subTotal * 2) / 100;
    const discountedTotal = subTotal - discount;
  
    // Store discount for display
    this.dicountprice = this.purchaseOrder.ProductDiscount > 0 ? (this.Totalsub * this.purchaseOrder.ProductDiscount) / 100 : 0;

  
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
  const cartData = this.responseData;

  const poBody = {
    statusAll: 'pending',
    email: cartData.retailer.email, // Retailer email
    manufacturerEmail: cartData.manufacturer.email,
    discount: cartData.retailer.productDiscount || 0,
    retailerPoDate: new Date(), // Current timestamp
    poNumber: cartData.orderNumber || '', // Assuming orderNumber is generated already
   cartId: cartData.products?.[0]?._id || '', // ✅ correct


    set: cartData.products?.[0]?.set || [],

    manufacturer: {
      email: cartData.manufacturer.email,
      fullName: cartData.manufacturer.fullName,
      companyName: cartData.manufacturer.companyName,
      address: cartData.manufacturer.address,
      state: cartData.manufacturer.state,
      country: cartData.manufacturer.country || 'India',
      pinCode: cartData.manufacturer.pinCode,
      mobNumber: cartData.manufacturer.mobNumber,
      GSTIN: cartData.manufacturer.GSTIN,
    },

    retailer: {
      email: cartData.retailer.email,
      fullName: cartData.retailer.fullName,
      companyName: cartData.retailer.companyName,
      address: cartData.retailer.address,
      state: cartData.retailer.state,
      country: cartData.retailer.country || 'India',
      pinCode: cartData.retailer.pinCode,
      mobNumber: cartData.retailer.mobNumber,
      GSTIN: cartData.retailer.GSTIN,
      logo: cartData.retailer.profileImg || '',
      productDiscount: cartData.retailer.productDiscount || '',
      category: cartData.retailer.category || '',
    }
  };

  this.authService.post('po-retailer-to-manufacture', poBody).subscribe(
    (res: any) => {
      console.log('PO Response:', res);
      this.communicationService.customSuccess('Purchase Order Generated Successfully');
      this.navigateFun();
    },
    (error) => {
      console.error('PO Creation Error:', error);
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

  const firstChunkSize = 20;
  const nextChunkSize = 30;

  if (array.length > 0) {
    // Push first 20
    this.tableChunks.push(array.slice(0, firstChunkSize));
    this.serialOffset.push(0);

    let start = firstChunkSize;
    while (start < array.length) {
      this.tableChunks.push(array.slice(start, start + nextChunkSize));
      this.serialOffset.push(start); // Serial starts from this index
      start += nextChunkSize;
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

    // Hide all chunks except current one
    const chunks = fullClone.querySelectorAll('.table-chunk');
    chunks.forEach((div, i) => {
      (div as HTMLElement).style.display = i === currentChunk ? 'block' : 'none';
    });

    // ✅ REMOVE the full header content after first page
    if (currentChunk > 0) {
      const headerContent = fullClone.querySelector('.page-header-content');
      if (headerContent) headerContent.remove();
    }

    // ✅ Include styles to maintain design
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((tag) => {
      fullClone.appendChild(tag.cloneNode(true));
    });

    // ✅ Insert into off-screen DOM for rendering
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
      scrollY: -window.scrollY
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
        renderChunk(); // Go to next table chunk
      } else {
    const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
const poNumber = this.purchaseOrder.poNumber || 'no-number';
pdf.save(`PO_${poDate}_${poNumber}.pdf`);
      }
    });
  };

  renderChunk();
}




  
}

