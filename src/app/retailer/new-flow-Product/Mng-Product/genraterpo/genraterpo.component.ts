import { CommonModule, Location } from '@angular/common';   
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndianCurrencyPipe } from 'app/custom.pipe';
@Component({
  selector: 'app-genraterpo',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
  templateUrl: './genraterpo.component.html',
  styleUrl: './genraterpo.component.scss',
})
export class GenraterpoComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
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
  currentDate = new Date().toLocaleDateString();

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
  sgst: number = 0;
  igst: number = 0;
  cgst: number = 0;

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
    const url = `retailer-cart-type2/place-order/products/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
this.chunkArray(this.responseData.set); // or whatever your full data list is
        const discountValue = res.retailer?.discountDetails?.productDiscount
          ? parseFloat(res.retailer.discountDetails.productDiscount)
          : 0;
  
        this.purchaseOrder = {
          supplierName: res.wholesaler?.companyName || '',
          supplierDetails: res.wholesaler?.fullName || '',
          supplierEmail: res.wholesaler?.email || '',
          supplierAddress: `${res.wholesaler?.address || ''}, ${res.wholesaler?.state || ''}`,
          supplierContact: res.wholesaler?.mobNumber || '',
          supplierGSTIN: res.wholesaler?.GSTIN || '',
          supplierPAN: res.wholesaler?.pan || '',
          buyerName: res.retailer?.companyName || '',
          buyerDetails: res.retailer?.fullName || '',
          buyerEmail: res.retailer?.email || '',
          buyerAddress: `${res.retailer?.address || ''}, ${res.retailer?.state || ''}`,
          buyerPhone: res.retailer?.mobNumber || '',
          buyerGSTIN: res.retailer?.GSTIN || '',
          buyerPAN: res.retailer?.pan || '',
          logoUrl: res.retailer?.profileImg || 'assets/images/company_logo.jpg',
          poNumber: res.poNumber || '',
          poDate: new Date().toLocaleDateString(),
          products: res.set || [],
          ProductDiscount: discountValue,
        };
  
        // Prepare size headers and pricing map
        this.extractSizesAndPrices(res.set);
  
        // Group products by design + colour
        this.mergedProducts = this.processGroupedProducts(res.set);
  
      },
      (error) => {
        console.error('Error fetching products:', error);
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

  discountedTotal: number = 0; // Add this property

  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalSub = 0;
    let totalDiscounted = 0;

    // Get discount percentage
    const discountValue = this.purchaseOrder.ProductDiscount
      ? parseFloat(this.purchaseOrder.ProductDiscount)
      : 0;

    // Step 1: Group products by design number
    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
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

      existingRow.quantities[product.size] =
        (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * parseFloat(product.price);
    });

    // Step 2: Calculate totals
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce(
        (acc: number, row: any) => acc + this.calculateTotalPrice(row, false), // ✅ Now fetches full price first
        0
      );

      let discountAmount = 0;
      if (discountValue > 0) {
        discountAmount = (group.subTotal * discountValue) / 100;
      }

      group.discountedTotal = group.subTotal - discountAmount;

      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });

    this.Totalsub = totalSub;
    this.discountedTotal = totalDiscounted;
    this.calculateGST();

    return Object.values(groupedByDesignNumber);
  }

  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;

    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    // Extract discount percentage
    const discountValue = this.purchaseOrder.ProductDiscount
      ? parseFloat(this.purchaseOrder.ProductDiscount)
      : 0;

    let discountAmount = 0;
    if (applyDiscount && discountValue > 0) {
      discountAmount = (total * discountValue) / 100;
    }

    const finalPrice = total - discountAmount;

    return applyDiscount ? finalPrice : total; // 🔹 Now returns the correct price!
  }
  calculateGST() {
    const discountedTotal = this.discountedTotal; // Get total after discount
  
    // Extract states from API response
    const retailerState = this.purchaseOrder.buyerAddress.split(' ').pop()?.trim().toLowerCase();
    const wholesalerState = this.purchaseOrder.supplierAddress.split(' ').pop()?.trim().toLowerCase();
  
    console.log(`🏢 Retailer State: ${retailerState}, 🏭 Wholesaler State: ${wholesalerState}`);
  
    if (retailerState && wholesalerState) {
      if (retailerState === wholesalerState) {
        // ✅ Same state → Apply SGST + CGST (9% each)
        this.sgst = (discountedTotal * 9) / 100;
        this.cgst = (discountedTotal * 9) / 100;
        this.igst = 0;
        console.log(`✅ States Match → Applying SGST: ₹${this.sgst}, CGST: ₹${this.cgst}, IGST: ₹${this.igst}`);
      } else {
        // ✅ Different states → Apply IGST (18%)
        this.sgst = 0;
        this.cgst = 0;
        this.igst = (discountedTotal * 18) / 100;
        console.log(`✅ States Do Not Match → Applying IGST: ₹${this.igst}`);
      }
    } else {
      console.warn("⚠️ Could not determine states correctly!");
    }
  
    // ✅ Update Grand Total
    this.totalGrandTotal = discountedTotal + this.sgst + this.cgst + this.igst;
    console.log(`💰 Final Grand Total: ₹${this.totalGrandTotal}`);
  }
  

  calculateDiscountedTotal(subTotal: number): number {
    // Apply discount (for example, 2% in this case)
    const discount = (subTotal * 2) / 100;
    const discountedTotal = subTotal - discount;

    // Store discount for display
    this.dicountprice = discount;

    return discountedTotal;
  }

  calculateGrandTotal(
    subTotal: number,
    discount: number,
    igst: number
  ): number {
    const discountedSubtotal = subTotal - discount;
    const igstAmount = (discountedSubtotal * igst) / 100; // Apply 18% IGST
    return discountedSubtotal + igstAmount;
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  addpo() {
  const cartBody = { ...this.responseData };

  // Inject productBy into every item in set
  if (Array.isArray(cartBody.set)) {
    const productByValue = this.responseData?.productBy || this.userProfile?.email || '';
    cartBody.set = cartBody.set.map((item: any) => ({
      ...item,
      productBy: productByValue
    }));
  }

  // Add top-level info if missing
  cartBody.email = this.userProfile?.email || '';
  cartBody.productBy = this.responseData?.productBy || this.userProfile?.email || '';

  // Remove unnecessary fields
  delete cartBody._id;
  delete cartBody.__v;
  delete cartBody.productId;

  cartBody.cartId = this.responseData?._id || '';

  console.log('📤 Sending Purchase Order:', cartBody);

  // this.authService.post('retailer-purchase-order-type2', cartBody).subscribe(
  this.authService.post('/po-retailer-to-wholesaler', cartBody).subscribe(

    (res: any) => {
      this.communicationService.customSuccess('Purchase Order Generated Successfully');
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
      let existingRow = flatList.find(
        (row) =>
          row.designNumber === designKey &&
          row.colourName === product.colourName
      );

      // If no existing row, create a new one
      if (!existingRow) {
        existingRow = {
          designNumber: product.designNumber,
          colourName: product.colourName,
          colourImage: product.colourImage,
          colour: product.colour,
          quantities: {},
          totalPrice: 0,
        };
        flatList.push(existingRow);
      }

      // Update quantities for this specific size
      if (product.size && product.quantity) {
        existingRow.quantities[product.size] =
          (existingRow.quantities[product.size] || 0) + product.quantity;
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



  navigateFun() {
    this.location.back();
  }

  getOriginalPrice(row: any): number {
    let total = 0;

    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    return total; // ✅ Returns the original price before discount
  }
}
