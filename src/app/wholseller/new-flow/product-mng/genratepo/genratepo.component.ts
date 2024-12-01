import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-genratepo',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule],
  templateUrl: './genratepo.component.html',
  styleUrls: ['./genratepo.component.scss']
})
export class GenratepoComponent implements OnInit {

  // Initialize properties
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
    totalInWords: ''
  };
  
  responseData: any; // New variable to store response data
  distributorId: string;
  products: any[] = [];
  userProfile: any;
  filteredData: any;
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
    console.log('Distributor ID:', this.distributorId);
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.distributorId);
  }

  // Method to fetch all products
  getAllProducts(distributorId: string) {
    const url = `type2-cart/place-order/products/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        console.log('All products:', res); // Log the response for debugging
        this.responseData = res; // Store the response in responseData

        // Update purchaseOrder from the response
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.city}, ${res.manufacturer.state} - ${res.manufacturer.pinCode}`,
          supplierContact: `${res.manufacturer.mobNumber}`,
          supplierGSTIN: res.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
          buyerName: res.wholesaler.companyName,
          logoUrl: this.authService.cdnPath + res.wholesaler.profileImg,
          buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.city}, ${res.wholesaler.state} - ${res.wholesaler.pinCode}`,
          buyerPhone: res.wholesaler.mobNumber,
          buyerEmail: res.wholesaler.email,
          buyerDetails: res.wholesaler.fullName,
          buyerGSTIN: res.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
          poDate: new Date().toLocaleDateString(),
          poNumber: res.poNumber,
          products: res.products || [],
        };

        // Process products if available
        if (res && res.results) {
          this.products = res.results;
          this.filteredData = this.products.find((product) => product.manufacturer.fullName);
          if (this.filteredData && Array.isArray(this.filteredData.set)) {
            this.extractSizesAndPrices(this.filteredData.set); // Extract sizes and prices
          } else {
            this.filteredData = { set: [] };
          }
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Method to extract sizes and prices
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

  // Method to process grouped products
  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0;
    let totalGST = 0;
    let totalSub = 0;

    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          gst: 0,
          grandTotal: 0
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
          totalPrice: 0
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }

      existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * product.price;
    });

    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row), 0);
      group.gst = this.calculateGST(group.subTotal);
      totalGST += group.gst;
      totalSub += group.subTotal;
      group.grandTotal = this.calculateGrandTotal(group.subTotal, group.gst);
      totalGrandTotal += group.grandTotal;
    });

    this.Totalsub = totalSub;
    this.gst = totalGST;
    this.totalGrandTotal = totalGrandTotal;

    return Object.values(groupedByDesignNumber);
  }

  calculateTotalPrice(row: any): number {
    let total = 0;

    this.sizeHeaders.forEach(size => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });

    return total;
  }

  calculateGST(subTotal: number): number {
    return (subTotal * 18) / 100; // 18% GST
  }

  calculateGrandTotal(subTotal: number, gst: number): number {
    return subTotal + gst;
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some(row => row.quantities[size] > 0);
  }

  // Method to add purchase order
  addpo() {
    const cartBody = this.responseData; // Use the stored response data as cartBody
    this.authService.post('type2-purchaseorder', cartBody).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Product Successfully Added in Cart');
      },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    );
  }
}
