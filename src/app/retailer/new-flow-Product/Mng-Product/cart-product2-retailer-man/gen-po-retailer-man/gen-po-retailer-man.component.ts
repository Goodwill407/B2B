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
  selector: 'app-gen-po-retailer-man',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
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
    private route: ActivatedRoute
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
        this.responseData = res; // Store the response
        console.log(res);
        
        // Update purchaseOrder from the response
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
          buyerName: res.retailer.companyName,
          logoUrl: res.retailer.profileImg || '', // Handle missing logo
          buyerAddress: `${res.retailer.address || ''}, ${res.retailer.city || ''}, ${res.retailer.state || ''} - ${res.retailer.pinCode || ''}`,
          buyerPhone: res.retailer.mobNumber || '',
          buyerEmail: res.retailer.email || '',
          email: res.retailer.email || '',  // Here, we are setting the retailer's email
          productBy: res.manufacturer.email || '',  // Ensure manufacturer email is correctly assigned
          buyerDetails: res.retailer.fullName || '',
          buyerGSTIN: res.retailer.GSTIN || 'GSTIN_NOT_PROVIDED',
          orderDate: new Date().toLocaleDateString(),
          orderNumber: res.orderNumber,
          products: res.products?.[0]?.set || [], // Updated to match new response structure
          ProductDiscount: res.retailer.productDiscount || 0,
        };
  
        // You can process products if necessary
        if (res.products?.[0]?.set && Array.isArray(res.products[0].set) && res.products[0].set.length > 0) {
          this.extractSizesAndPrices(res.products[0].set);
          this.mergedProducts = this.processGroupedProducts(res.products[0].set);
          this.filteredData = res.products[0].set[0];
  
          if (this.filteredData) {
            this.mergedProducts = this.flattenProductData(res.products[0].set);
          }
        } else {
          this.filteredData = null;
          this.mergedProducts = [];
        }
      },
      (error) => {
        console.error("Error fetching products:", error);
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
  
    // Assume that the buyer and supplier states are in the addresses
    const retailerState = this.purchaseOrder.buyerAddress.split(',')[2]?.trim().split(' ')[0];
    const wholesalerState = this.purchaseOrder.supplierAddress.split(',')[2]?.trim().split(' ')[0];
  
    // Determine whether to apply SGST/CGST or IGST based on states
    if (retailerState === wholesalerState) {
      // Apply SGST and CGST if both states are the same
      const gstRate = 9; // SGST and CGST are 9% each
      this.sgst = (discountedTotal * gstRate) / 100;
      this.cgst = (discountedTotal * gstRate) / 100;
      this.igst = 0; // No IGST when states are the same
    } else {
      // Apply IGST if states are different
      const gstRate = 18; // IGST is 18%
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (discountedTotal * gstRate) / 100;
    }
  
    // Round the grand total to 2 decimal places
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
    const cartBody = { ...this.responseData };
    // Create a copy of the response data
  
    // Remove unwanted fields to clean up the data
    delete cartBody.__v;
    delete cartBody._id;
    delete cartBody.productId;
  
    // Post the cleaned data to the backend
    this.authService.post('rtl-toMnf-po', cartBody).subscribe(
      (res: any) => {
        console.log(res);
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

