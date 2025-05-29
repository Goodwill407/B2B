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
    selector: 'app-retailerpo-generate',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe],
    templateUrl: './retailerpo-generate.component.html',
    styleUrl: './retailerpo-generate.component.scss'
  })
  export class RetailerpoGenerateComponent {
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
  const url = `retailer-purchase-order-type2/${distributorId}`;
  this.authService.get(url).subscribe(
    (res: any) => {
      this.responseData = res;

      const productSet = res.set || [];

      // Basic PO info
      this.purchaseOrder = {
        supplierName: res.wholesaler.companyName,
        supplierDetails: res.wholesaler.fullName,
        supplierAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.pinCode} - ${res.wholesaler.state}`,
        supplierContact: res.wholesaler.mobNumber,
        supplierGSTIN: res.wholesaler.GSTIN || '',
        buyerName: res.retailer.companyName,
        buyerAddress: `${res.retailer.address}, ${res.retailer.city}, ${res.retailer.pinCode} - ${res.retailer.state}`,
        buyerPhone: res.retailer.mobNumber,
        buyerEmail: res.retailer.email,
        buyerPAN: res.retailer.pan || '',
        logoUrl: res.retailer.profileImg || '',
        poDate: new Date().toLocaleDateString(),
        poNumber: res.poNumber,
        products: productSet,
        ProductDiscount: res.retailer.discountDetails.productDiscount || 0
      };

      // Chunk for printing
      this.chunkArray(productSet);

      // Totals
      this.calculateTotalsFromRawData(productSet);
    },
    (err) => {
      console.error('Error:', err);
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
  this.discountedTotal = subtotal - discountAmount;
  this.dicountprice = discountAmount;

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

    discountedTotal: number = 0; // Add this property

    processGroupedProducts(productSet: any[]): any[] {
      const groupedByDesignNumber: any = {};
      let totalSub = 0;
      let totalDiscountAmount = 0;
  
      // ✅ Ensure `productDiscount` is fetched correctly from API response
      const productDiscount = parseFloat(this.responseData?.discountDetails?.productDiscount) || 0;
      console.log("✅ Extracted Product Discount:", productDiscount); // Debugging
  
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
  
      Object.values(groupedByDesignNumber).forEach((group: any) => {
          group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, false), 0);
  
        // ✅ Correct Discount Calculation
const discountAmount = (group.subTotal * this.purchaseOrder.ProductDiscount) / 100; 
group.discountedTotal = group.subTotal - discountAmount;

          totalSub += group.subTotal;
          totalDiscountAmount += discountAmount;
      });
  
      // ✅ Assign to Class Properties
      this.Totalsub = totalSub;
      this.dicountprice = totalDiscountAmount; // ✅ Ensure discount amount is stored correctly
      this.discountedTotal = totalSub - totalDiscountAmount; // ✅ Apply discount to subtotal
  
      console.log("✅ Final Discount Amount Stored:", this.dicountprice); // Debugging
  
      // ✅ Fix GST Calculation
      this.calculateGST();
  
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
    
      
  calculateGST(): void {
  const retailerState = this.responseData.retailer?.state?.trim().toLowerCase();
  const wholesalerState = this.responseData.wholesaler?.state?.trim().toLowerCase();
  const discountedTotal = this.discountedTotal;

  if (retailerState === wholesalerState) {
    this.sgst = (discountedTotal * 9) / 100;
    this.cgst = (discountedTotal * 9) / 100;
    this.igst = 0;
  } else {
    this.sgst = 0;
    this.cgst = 0;
    this.igst = (discountedTotal * 18) / 100;
  }
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

  const firstPage = 20;
  const restPages = 40;

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

    const chunks = fullClone.querySelectorAll('.table-chunk');
    chunks.forEach((div, i) => {
      (div as HTMLElement).style.display = i === currentChunk ? 'block' : 'none';
    });

    if (currentChunk > 0) {
      const header = fullClone.querySelector('.header');
      if (header) header.remove();
    }

    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach((tag) => fullClone.appendChild(tag.cloneNode(true)));

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

