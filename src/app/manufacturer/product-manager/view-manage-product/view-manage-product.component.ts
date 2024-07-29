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
  allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "Accessories", "Footwear"];
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allClothing: any;
  allSubCategory: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.getAllBrands();
    this.getClothingType();
    this.getSubCategory();
    this.getAllProducts();
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

  getClothingType() {
    this.authService.get('clothing-mens').subscribe(res => {
      if (res) {
        this.allClothing = res.results;
      }
    }, (error) => {
      console.log(error);
    });
  }

  getSubCategory() {
    const f = this.filters;
    this.authService.get(`sub-category?productType=${f.productType}&clothing=${f.clothing}&gender=${f.gender}`).subscribe(res => {
      if (res) {
        this.allSubCategory = res.results;
      }
    }, (error) => {
      console.log(error);
    });
  }

  getAllProducts() {
    this.authService.get(`products?page=${this.page}&limit=${this.limit}`).subscribe((res: any) => {
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
}
