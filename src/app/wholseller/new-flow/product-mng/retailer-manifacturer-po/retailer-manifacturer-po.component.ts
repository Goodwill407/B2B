import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailer-manifacturer-po',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    AccordionModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retailer-manifacturer-po.component.html',
  styleUrl: './retailer-manifacturer-po.component.scss'
})
export class RetailerManifacturerPoComponent {
  products: any[] = [];
  userProfile: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [manufacturer: string]: { [designNumber: string]: { [size: string]: number } } } = {};
  manufacturerTotals: { [manufacturer: string]: { subtotal: number; gst: number; grandTotal: number } } = {};
  bottomAdImage: string[] = ['assets/images/adv/ads2.jpg', 'assets/images/adv/ads.jpg'];
  manufacturers: any[] = [];
   expandedRows: Set<number> = new Set();

  constructor(private authService: AuthService, private router: Router) {}

   ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getManufacturerPOList(this.userProfile.email);
  }

  getManufacturerPOList(email: string): void {
    const url = `po-wholesaler-to-manufacture/get-combined-po-items?wholesalerEmail=${email}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res && res.success && Array.isArray(res.data)) {
          this.manufacturers = res.data;
        }
      },
      (error) => console.error('Failed to load manufacturer PO list', error)
    );
  }

  viewPO(manufacturer: any ): void {
    this.router.navigate(['/wholesaler/new/product/getmanpo'], {
      queryParams: {
        memail: manufacturer.manufacturerEmail,
        wemail : this.userProfile?.email || '',  
      },
    });
  }

  toggleRetailers(index: number): void {
    if (this.expandedRows.has(index)) {
      this.expandedRows.delete(index);
    } else {
      this.expandedRows.add(index);
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedRows.has(index);
  }

  // extractSizesAndPrices(products: any[]): void {
  //   const sizeSet = new Set<string>();
  //   const priceHeaders: { [manufacturer: string]: { [designNumber: string]: { [size: string]: number } } } = {};

  //   products.forEach((product) => {
  //     const manufacturer = product.manufacturer?.companyName;
  //     if (!manufacturer) return;

  //     if (!priceHeaders[manufacturer]) priceHeaders[manufacturer] = {};

  //     product.set.forEach(({ size, price, designNumber }: any) => {
  //       sizeSet.add(size);
  //       if (!priceHeaders[manufacturer][designNumber]) priceHeaders[manufacturer][designNumber] = {};
  //       priceHeaders[manufacturer][designNumber][size] = price;
  //     });
  //   });

  //   this.sizeHeaders = Array.from(sizeSet).sort();
  //   this.priceHeaders = priceHeaders;
  // }

  // processGroupedProducts(productSet: any[], manufacturerName: string): any[] {
  //   const grouped: any = {};
  //   let subtotal = 0;

  //   productSet.forEach((product) => {
  //     const key = product.designNumber;
  //     if (!grouped[key]) grouped[key] = { designNumber: key, rows: [], subTotal: 0 };

  //     let row = grouped[key].rows.find((r: any) => r.colourName === product.colourName);
  //     if (!row) {
  //       row = { colourName: product.colourName, quantities: {}, totalPrice: 0 };
  //       grouped[key].rows.push(row);
  //     }

  //     row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
  //     row.totalPrice += product.price * product.quantity;
  //     subtotal += product.price * product.quantity;
  //   });

  //   const gst = this.calculateGST(subtotal);
  //   const grandTotal = subtotal + gst;

  //   this.manufacturerTotals[manufacturerName] = { subtotal, gst, grandTotal };

  //   return Object.values(grouped);
  // }

  // calculateGST(subtotal: number): number {
  //   return parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST
  // }

  // placeOrder(prod: any): void {
  //   this.router.navigate(['/wholesaler/new/product/getmanpo'], {
  //     queryParams: { memail: prod.manufacturer.email, wemail: prod.wholesaler.email, poNumber: prod.poNumber },
  //   });
  // }
}