import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  brand:string = '';
  totalResults: any;

  constructor(public authService: AuthService, private router:Router) { 
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.getAllProducts();
    this.getAllBrand();
  }

  getAllProducts(brand: string='') {
    let url = `products/filter-products?limit=${this.limit}&page=${this.page}`;
   
    const Object={
      "productBy": this.userProfile.email,
      "brand": brand
    }

    this.authService.post(url,Object).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.results;
      }
    }, (error) => {
      console.log(error);
    });
  }

  getAllBrand(){
    this.authService.get(`brand?page=${0}&brandOwner=${this.userProfile.email}`).subscribe((res: any) => {
      this.allBrand = res.results;
    },(err: any) => {
      // this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts();
  }

  editProduct(id:any) {
    this.router.navigate(['mnf/add-new-product'], { queryParams: { id: id } });
  }
  productSummary(id:any){
    this.router.navigate(['mnf/product-summary'], { queryParams: { id: id } });
  }
}
