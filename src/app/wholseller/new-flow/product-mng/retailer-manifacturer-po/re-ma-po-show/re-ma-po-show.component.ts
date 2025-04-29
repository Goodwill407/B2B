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
    selector: 'app-re-ma-po-show',
    standalone: true,
    imports: [CommonModule, FormsModule, AccordionModule, TableModule],
    templateUrl: './re-ma-po-show.component.html',
    styleUrl: './re-ma-po-show.component.scss'
  })
  export class ReMaPoShowComponent {
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
    
    // add alongside your other totals
    discountAmount: number = 0;

    constructor(
      public authService: AuthService,
      private router: Router,
      private communicationService: CommunicationService,
      private route: ActivatedRoute
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
      const url = `retailer-purchase-order-type2/purchase-orders/wholesaler-email/combined-order/single?wholesaleremail=${this.distributorId2}&productBy=${this.distributorId}`;
      this.authService.get(url).subscribe(
        (res: any) => {
          this.responseData = res; // Store the response in responseData
    
          console.log(res);
          // Update purchaseOrder from the response
          this.purchaseOrder = {
            supplierName: res.manufacturer.companyName,
            supplierDetails: res.manufacturer.fullName,
            supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
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
            products: res.products || [],
            ProductDiscount: res.discounts?.[0]?.productDiscount || 0,  // Set product discount
          };
    
          if (res.set && Array.isArray(res.set) && res.set.length > 0) {
            this.extractSizesAndPrices(res.set); // Extract unique sizes and prices
    
            // Process grouped products and update mergedProducts
            this.mergedProducts = this.processGroupedProducts(res.set);
            this.filteredData = res.set[0];
    
            // Flatten the set into mergedProducts
            if (this.filteredData) {
              this.mergedProducts = this.flattenProductData(res.set); // Pass the entire set array
            }
          } else {
            this.filteredData = null;
            this.mergedProducts = [];
          }
        },
        (error) => {
          console.error("Error fetching data:", error);
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
      // a) Group container by designNumber → colourName
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
    
      // b) Build rows
      productSet.forEach(product => {
        const key = product.designNumber;
        if (!grouped[key]) {
          grouped[key] = {
            designNumber: key,
            rows: [],
            subTotal: 0,
            discountedTotal: 0,
            grandTotal: 0
          };
        }
        let row = grouped[key].rows.find(r => r.colourName === product.colourName);
        if (!row) {
          row = { colourName: product.colourName, quantities: {} };
          grouped[key].rows.push(row);
        }
        // accumulate quantity
        row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
      });
    
      // c) Calculate per-group subtotals & discounted totals
      Object.values(grouped).forEach(group => {
        // raw subtotal (no discount)
        group.subTotal = group.rows.reduce(
          (sum, row) => sum + this.calculateTotalPrice(row, false),
          0
        );
        // discounted subtotal (with %)
        group.discountedTotal = group.rows.reduce(
          (sum, row) => sum + this.calculateTotalPrice(row, true),
          0
        );
    
        totalSub        += group.subTotal;
        totalDiscounted += group.discountedTotal;
      });
    
      // d) Store overall discount & new subtotal
      this.discountAmount   = totalSub - totalDiscounted;
      this.Totalsub         = totalSub;
      this.discountedTotal  = totalDiscounted;
    
      // e) Recompute GST on the post-discount total
      this.calculateGST();  // sets this.sgst, this.cgst, this.igst
    
      // f) Compute grand totals
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
    
    
    discountedTotal: number = 0;

    calculateGST(): void {
      const discountedTotal = this.discountedTotal;
    
      // Pull states directly from your API response
      const wholesalerState = this.responseData.manufacturer.state
        ?.trim()
        .toLowerCase();
      const retailerState = this.responseData.wholesaler.state
        ?.trim()
        .toLowerCase();
    
      if (wholesalerState && retailerState && wholesalerState === retailerState) {
        // Same state → intra-state: SGST + CGST @ 9% each
        this.sgst = (discountedTotal * 9) / 100;
        this.cgst = (discountedTotal * 9) / 100;
        this.igst = 0;
      } else {
        // Different state → inter-state: IGST @ 18%
        this.sgst = 0;
        this.cgst = 0;
        this.igst = (discountedTotal * 18) / 100;
      }
    
      // Update overall grand total
      this.totalGrandTotal = discountedTotal + this.sgst + this.cgst + this.igst;
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

  printPO(): void {
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

    
  }
