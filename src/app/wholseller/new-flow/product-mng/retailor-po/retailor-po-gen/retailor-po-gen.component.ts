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
  selector: 'app-retailor-po-gen',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
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
    const url = `retailer-purchase-order-type2/${distributorId}`
    this.authService.get(url).subscribe(
      (res: any) => {
      
        this.responseData = res; // Store the response in responseData
        console.log(this.responseData)
        // Update purchaseOrder from the response
        this.purchaseOrder = {
          supplierName: res.wholesaler.companyName,
          supplierDetails: res.wholesaler.fullName,
          supplierAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
          supplierContact: `${res.wholesaler.mobNumber}`,
          supplierGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
          buyerName: res.retailer.companyName,
          logoUrl: res.retailer.profileImg,
          buyerAddress: `${res.retailer.address}, ${res.retailer.city}, ${res.retailer.state} - ${res.retailer.pinCode}`,
          buyerPhone: res.retailer.mobNumber,
          buyerEmail: res.retailer.email,
          buyerDetails: res.retailer.fullName,
          buyerGSTIN: res.retailer.GSTIN || 'GSTIN_NOT_PROVIDED',
          poDate: new Date().toLocaleDateString(),
          poNumber: res.poNumber,
          products: res.set || [],
          // new — parse it to a Number
          ProductDiscount: parseFloat(res.retailer.discountDetails?.productDiscount ?? '0'),

        };

        if (res.set && Array.isArray(res.set) && res.set.length > 0) {
          this.extractSizesAndPrices(res.set); // <-- Ensure this is called
  
          // Process grouped products and update mergedProducts
          this.mergedProducts = this.processGroupedProducts(res.set);
          this.filteredData = res.set[0];
        
      
          // Proceed if filteredData is not empty
          if (this.filteredData) {
              // Flatten the set into mergedProducts
              this.mergedProducts = this.flattenProductData(res.set);  // Pass the entire set array
              
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

navigateFun() {
  this.location.back();
}

  
}

