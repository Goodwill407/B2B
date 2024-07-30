import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-view-manage-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './view-manage-product.component.html',
  styleUrls: ['./view-manage-product.component.scss']
})
export class ViewManageProductComponent implements OnInit, OnDestroy {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    clothing: '',
    subCategory: ''
  };

  products: any[] = [];
  allBrand: any;  
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allProductType = [];
   allClothingType = [];
   allSubCategory = [];
 
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile:any

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;

  constructor(public authService: AuthService) { 
  this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.getAllBrands();
    this.getAllSubCategory()
    this.getAllProducts()
    // this.getClothingType();
    // this.getSubCategory();
    // this.getAllProducts();
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  applyFilters(): void {
    console.log('Filters applied:', this.filters);
  }

  changeProductImage(product: any, color: string): void {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor) {
      product.selectedImageUrl = selectedColor.productImages[0];
      product.selectedColor = color;
    }
  }

  getAllBrands() {
    this.authService.get(`brand?page=1`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }
  // getAllProducts() {
  //   this.authService.get(`products/filter-products?&productBy=${this.userProfile.email}`).subscribe((res: any) => {
  //     if (res) {
  //       this.totalResults = res.totalResults;
  //       this.products = res.results.map((product: any) => ({
  //         designNo: product.designNumber,
  //         selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
  //         title: product.productTitle,
  //         description: product.productDescription,
  //         selectedColor: product.colourCollections[0]?.colour || '',
  //         colors: product.colourCollections.map((c: any) => c.colour),
  //         colourCollections: product.colourCollections,
  //         stock: product.quantity || 2000, // Replace with actual stock value if available
  //         id: product.id,
  //         hoverIndex: 0
  //       }));

  //       this.products.forEach(product => {
  //         if (!product.selectedColor) {
  //           this.extractColorFromImage(product);
  //         }
  //       });
  //     }
  //   });
  // }
  getAllProducts() {
    let url = `products/filter-products?productBy=${this.userProfile.email}`;//&page=${this.page}&limit=${this.limit}
  
    const brand = this.filters.brand
    const productType = this.filters.productType
    const gender=this.filters.gender
    const clothing=this.filters.clothing 
    const subCategory=this.filters.subCategory
  
    if (brand) {
      url += `&brand=${brand}`;
    }
  
    if (productType) {
      url += `&productType=${productType}`;
    }
    if(gender){
      url += `&gender=${gender}`;
    }
    if(clothing){
      url += `&clothing=${clothing}`;
    }
    if(subCategory){
      url += `&subCategory=${subCategory}`;
    }
  
    this.authService.get(url).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.results.map((product: any) => ({
          designNo: product.designNumber,
          selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
          title: product.productTitle,
          description: product.productDescription,
          selectedColor: product.colourCollections[0]?.colour || '',
          colors: product.colourCollections.map((c: any) => c.colour),
          colourCollections: product.colourCollections,
          stock: product.quantity || 2000, // Replace with actual stock value if available
          id: product.id,
          hoverIndex: 0
        }));
  
        this.products.forEach(product => {
          if (!product.selectedColor) {
            this.extractColorFromImage(product);
          }
        });
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

  extractColorFromImage(product: any): void {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = this.authService.cdnPath + product.selectedImageUrl;

    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image);
      product.selectedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.changeProductImage(product, product.selectedColor);
    };
  }

  onMouseEnter(product: any): void {
    this.hoverIntervals[product.id] = setInterval(() => {
      this.slideNextImage(product);
    }, 1000);
  }

  onMouseLeave(product: any): void {
    clearInterval(this.hoverIntervals[product.id]);
  }

  slideNextImage(product: any): void {
    const currentIndex = product.hoverIndex;
    const nextIndex = (currentIndex + 1) % product.colourCollections.length;
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.colourCollections[nextIndex].productImages[0];
  }

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) {
      clearInterval(this.hoverIntervals[key]);
    }
  }

  getAllSubCategory() {
    const productType = this.filters.productType
    const gender = this.filters.gender
    const clothing = this.filters.clothing
  
    let url = 'sub-category';
  
    if (productType) {
      url += `?productType=${productType}`;
    }
    if (gender) {
      url += (url.includes('?') ? '&' : '?') + `gender=${gender}`;
    }
    if (clothing) {
      url += (url.includes('?') ? '&' : '?') + `clothing=${clothing}`;
    }
  
    // Clear previous values
    // this.allProductType = [];
    // this.allClothingType = [];
    // this.allSubCategory = [];
  
    this.authService.get(url).subscribe(res => {
      if (res) {
        this.allProductType = Array.from(new Set(res.results.map((item: any) => item.productType)));
        this.allClothingType = Array.from(new Set(res.results.map((item: any) => item.category)));
        this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
      }
    }, (error) => {
      console.log(error);
    });
  }
}
