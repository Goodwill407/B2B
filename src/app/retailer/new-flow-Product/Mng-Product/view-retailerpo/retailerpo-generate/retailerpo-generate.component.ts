import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailerpo-generate',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
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
  discountedTotal: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute
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
          logoUrl: this.authService.cdnPath + res.retailer.profileImg,
          buyerAddress: `${res.retailer.address}, ${res.retailer.city}, ${res.retailer.state} - ${res.retailer.pinCode}`,
          buyerPhone: res.retailer.mobNumber,
          buyerEmail: res.retailer.email,
          buyerDetails: res.retailer.fullName,
          buyerGSTIN: res.retailer.GSTIN || 'GSTIN_NOT_PROVIDED',
          poDate: new Date().toLocaleDateString(),
          poNumber: res.poNumber,
          products: res.set || [],
          ProductDiscount: res.retailer.productDiscount,
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
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0;
    let totalGST = 0;
    let totalSub = 0;
    let totalDiscounted = 0;
  
    productSet.forEach((product) => {
      const designKey = product.designNumber;
  
      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          gst: 0,
          grandTotal: 0,
          discountedTotal: 0,
        };
      }
  
      let existingRow = groupedByDesignNumber[designKey].rows.find(
        (row: any) => row.colourName === product.colourName
      );
  
      if (!existingRow) {
        existingRow = {
          colourName: product.colourName,
          colourImage: product.colourImage,
          colour: product.colour,
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
      group.discountedTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, true), 0);
      group.gst = this.calculateGST(group.discountedTotal);
      totalGST += group.gst;
      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
      group.grandTotal = this.calculateGrandTotal(group.discountedTotal, group.gst);
      totalGrandTotal += group.grandTotal;
    });
  
    this.Totalsub = totalSub;
    this.discountedTotal = totalDiscounted;
    this.gst = totalGST;
    this.totalGrandTotal = totalGrandTotal;
  
    return Object.values(groupedByDesignNumber);
  }
  
  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;
  
    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });
  
    if (applyDiscount && this.purchaseOrder.ProductDiscount > 0) {
      const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
      total -= discount;
    }
  
    return total;
  }

  calculateGST(subTotal: number): number {
    return (subTotal * 18) / 100; // 18% GST
  }

  calculateGrandTotal(subTotal: number, gst: number): number {
    return subTotal + gst;
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
  
    // Post the cleaned data to the backend
    this.authService.post('retailer-purchase-order-type2', cartBody).subscribe(
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


  
}

