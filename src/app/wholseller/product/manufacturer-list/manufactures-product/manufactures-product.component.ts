import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-manufactures-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './manufactures-product.component.html',
  styleUrl: './manufactures-product.component.scss'
})
export class ManufacturesProductComponent {
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
  mnfEmail: any;

  constructor(public authService: AuthService, private route:ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mnfEmail = params['email'];
      if (this.mnfEmail) {
        this.getAllProducts(this.mnfEmail);
      }
    })
    this.getAllBrands();
    this.getClothingType();
    this.getSubCategory();
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
    this.authService.get(`brand?page=1&brandOwner=${this.mnfEmail}`).subscribe((res: any) => {
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

  getAllProducts(email: string) {
    // const url = `products/filter-products?page=${this.page}&limit=${this.limit}&productBy=${email}`
    const url = `products/filter-products?productBy=${email}&page=${this.page}&limit=${this.limit}`
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
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts(this.mnfEmail);
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
