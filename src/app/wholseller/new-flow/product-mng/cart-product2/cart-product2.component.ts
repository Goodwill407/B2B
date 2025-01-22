  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router';
  import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
  import { AccordionModule } from 'primeng/accordion';
  import { TableModule } from 'primeng/table';

  @Component({
    selector: 'app-cart-product2',
    standalone: true,
    templateUrl: './cart-product2.component.html',
    styleUrls: ['./cart-product2.component.scss'],
    imports: [
      CommonModule,
      FormsModule,
      RouterModule,
      TableModule,
      AccordionModule,
      BottomSideAdvertiseComponent
    ],
  })
  export class CartProduct2Component {
    products: any[] = [];
    processedProducts: any[] = [];
    userProfile: any;
    sizeHeaders: string[] = [];
    priceHeaders: { [size: string]: number } = {};
    bottomAdImage: string[] = ['assets/images/adv/ads2.jpg', 'assets/images/adv/ads.jpg'];
  
    constructor(
      public authService: AuthService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      if (this.userProfile && this.userProfile.email) {
        this.getAllProducts(this.userProfile.email);
      }
    }
  
    getAllProducts(email: string): void {
      const url = `type2-cart?email=${email}`;
      this.authService.get(url).subscribe(
        (res: any) => {
          if (res && res.results) {
            this.products = res.results;
            this.processData();
          }
        },
        (error) => console.error(error)
      );
    }
  
    processData(): void {
      // Process each product and precompute grouped data
      this.processedProducts = this.products.map((prod) => {
        const groupedProducts = this.groupProductsByDesign(prod.set);
        this.extractSizesAndPrices(prod.set);
        const totals = this.calculateTotals(groupedProducts);
  
        return {
          ...prod,
          groupedProducts,
          totals,
        };
      });
    }
  
    groupProductsByDesign(productSet: any[]): any[] {
      const groupedByDesign: any = {};
      productSet.forEach((product) => {
        const designKey = product.designNumber;
  
        if (!groupedByDesign[designKey]) {
          groupedByDesign[designKey] = {
            designNumber: product.designNumber,
            rows: [],
          };
        }
  
        let existingRow = groupedByDesign[designKey].rows.find(
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
          groupedByDesign[designKey].rows.push(existingRow);
        }
  
        existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
        existingRow.totalPrice += product.quantity * product.price;
      });
  
      return Object.values(groupedByDesign);
    }
  
    extractSizesAndPrices(productSet: any[]): void {
      const uniqueSizes = new Set<string>();
      this.priceHeaders = {};
  
      productSet.forEach((product) => {
        if (product.size && product.price) {
          uniqueSizes.add(product.size);
          this.priceHeaders[product.size] = parseFloat(product.price);
        }
      });
  
      this.sizeHeaders = Array.from(uniqueSizes);
    }
  
    calculateTotals(groupedProducts: any[]): any {
      let subTotal = 0;
      groupedProducts.forEach((group) => {
        group.rows.forEach((row: any) => {
          subTotal += row.totalPrice;
        });
      });
  
      const gst = (subTotal * 18) / 100;
      const grandTotal = subTotal + gst;
  
      return { subTotal, gst, grandTotal };
    }
  
    placeOrder(prod: any): void {
      if (!prod || !prod._id) {
        console.error('No distributor ID found:', prod);
        return;
      }
      this.authService.setOrderData({ distributorId: prod._id });
      this.router.navigate(['wholesaler/new/product/viewpo', prod._id]);
    }
  
    trackByManufacturer(index: number, item: any): string {
      return item.manufacturer.fullName;
    }
  }
  