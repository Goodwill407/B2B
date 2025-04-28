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
  selector: 'app-view-wholesaler-po',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
  templateUrl: './view-wholesaler-po.component.html',
  styleUrl: './view-wholesaler-po.component.scss'
})
export class ViewWholesalerPoComponent {
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
    const url = `type2-purchaseorder/${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
       
        this.responseData = res; // Store the response in responseData
        console.log(res)
        // Update purchaseOrder from the response
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
          supplierContact: `${res.manufacturer.mobNumber}`,
          supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
          buyerName: res.wholesaler.companyName,
          logoUrl:res.wholesaler.profileImg,
          buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
          buyerPhone: res.wholesaler.mobNumber,
          buyerEmail: res.wholesaler.email,
          buyerDetails: res.wholesaler.fullName,
          buyerDetails2: res.manufacturer.fullName,
          buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
          poDate: new Date().toLocaleDateString(),
          poNumber: res.poNumber,
          products: res.products || [],
          ProductDiscount: res.wholesaler.productDiscount !== undefined && res.wholesaler.productDiscount !== '' ? parseFloat(res.wholesaler.productDiscount) : 0,  // Ensure we handle undefined and empty values properly
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
    let m = this.responseData.manufacturer.state?.trim().toLowerCase()  || '';
    let w = this.responseData.wholesaler.state?.trim().toLowerCase()    || '';
    // treat “mh” vs “maharashtra” as same:
    const same = m === w || m.includes(w) || w.includes(m);
  
    if (same) {
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
