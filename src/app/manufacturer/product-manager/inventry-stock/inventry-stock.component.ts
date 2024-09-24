import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-inventry-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PaginatorModule,
    TableModule
  ],
  templateUrl: './inventry-stock.component.html',
  styleUrl: './inventry-stock.component.scss'
})
export class InventryStockComponent {

  products: any[] = [];
  allBrand: any;  
 
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile: any;
  totalResults: any;

  constructor(public authService: AuthService) { 
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.getAllProducts();
  }

  getAllProducts() {
    let url = `products/filter-products?limit=${this.limit}&page=${this.page}`;
   
    const Object={
      "productBy": this.userProfile.email,
      // "brand":this.filters.brand
    }

   

    this.authService.post(url,Object).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.results;
        // this.products = res.results.map((product: any) => ({
        //   designNo: product.designNumber,
        //   selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
        //   selectedImageUrls: product.colourCollections[0]?.productImages || [], // Initialize with all images for the first color
        //   title: product.productTitle,
        //   description: product.productDescription,
        //   selectedColor: product.colourCollections[0]?.colour || '',
        //   colors: product.colourCollections.map((c: any) => c.colour),
        //   colourCollections: product.colourCollections,
        //   stock: product.quantity || 2000, // Replace with actual stock value if available
        //   id: product.id,
        //   hoverIndex: 0
        // }));
      }
    }, (error) => {
      console.log(error);
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts();
  }

}
