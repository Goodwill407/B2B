import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-product-bom-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule,
    BadgeModule
  ],
  templateUrl: './product-bom-list.component.html',
  styleUrls: ['./product-bom-list.component.scss']
})
export class ProductBomListComponent implements OnInit, OnDestroy {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: ''
  };

  products: any[] = [];
  allBrand: any;
  allGender = ['Men', 'Women', 'Boys', 'Girls'];
  allProductType = ["Clothing"];
  allcategory = [];
  allSubCategory = [];

  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  userProfile: any;

  hoverIntervals: any = {};
  totalResults: any;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.getAllBrands();
    this.getAllProducts();
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  getAllBrands() {
    this.authService.get(`brand?brandOwner=${this.userProfile.email}`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getCategoryByProductTypeAndGender() {
    const productType = this.filters.productType;
    const gender = this.filters.gender;

    this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`).subscribe((res: any) => {
      if (res) {
        this.allSubCategory = [];
      }
      this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category)));
    }, error => {
      console.log(error);
    });
  }

  getSubCategoryBYProductType_Gender_and_Category() {
    const productType = this.filters.productType;
    const gender = this.filters.gender;
    const category = this.filters.category;
    const object = {
      "productType": productType,
      "gender": gender,
      "category": category,
    }

    this.authService.post(`sub-category/filter`, object).subscribe((res: any) => {
      if (res) {
        this.allSubCategory = [];
      }
      this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
    }, error => {
      console.log(error);
    });
  }

  getAllProducts() {
  let url = `type2-products/filter-products`;

  const Object = {
    "productBy": this.userProfile.email,
    "brand": this.filters.brand,
    "productType": this.filters.productType,
    "gender": this.filters.gender,
    "clothing": this.filters.category,
    "subCategory": this.filters.subCategory,
    "limit": this.limit,
    "page": this.page
  }

  this.authService.post(url, Object).subscribe((res: any) => {
    if (res) {
      this.totalResults = res.totalResults;
      this.products = res.results.map((product: any) => ({
        designNo: product.designNumber,
        selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
        selectedImageUrls: product.colourCollections[0]?.productImages || [],
        title: product.productTitle,
        description: product.productDescription,
        selectedColor: product.colourCollections[0]?.colour || '',
        colors: product.colourCollections.map((c: any) => c.colour),
        colourCollections: product.colourCollections,
        stock: product.quantity || 2000,
        id: product.id,
        hoverIndex: 0,
        bomFilled: product.bomFilled || false
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
    image.src = (product.selectedImageUrl || '/b2b/1727183682898-no-image.png');

    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image);
      product.selectedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.changeProductImage(product, product.selectedColor);
    };
  }

  navigateToImage(product: any, index: number): void {
    product.hoverIndex = index;
    product.selectedImageUrl = product.selectedImageUrls[index];
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
    const nextIndex = (currentIndex + 1) % product.selectedImageUrls.length;
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.selectedImageUrls[nextIndex];
  }

  disableImage(product: any, color: string): boolean {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor.productImages.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  changeProductImage(product: any, color: string): void {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor) {
      product.selectedImageUrls = selectedColor.productImages;
      product.selectedColor = color;
    }
  }

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) {
      clearInterval(this.hoverIntervals[key]);
    }
  }

  // Navigate to Add BOM page
  navigateToAddBom(product: any): void {
    this.router.navigate(['/mnf/add-product-bom'], {
      queryParams: {
        productId: product.id,
        designNumber: product.designNo
      }
    });
  }

   navigateToViewBom(product: any): void {
    if (!product.bomFilled) {
        // Optional: Alert if trying to view non-existent BOM
        alert("BOM has not been created yet.");
        return;
    }
    this.router.navigate(['/mnf/view-product-bom', product.id]);
  }

 
}
