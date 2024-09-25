import { Component } from '@angular/core';
import ColorThief from 'colorthief';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-ordered-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './ordered-product.component.html',
  styleUrl: './ordered-product.component.scss'
})
export class OrderedProductComponent {
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
  userProfile: any;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;
  mnfEmail: any;

  constructor(public authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService) { }

  ngOnInit() {
    this.getAllProducts();
  }

  getAllProducts(){
    this.authService.get('wholesaler-products?wholesalerEmail='+this.authService.currentUserValue.email).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.results.map((product: any) => ({
          designNo: product.designNumber,
          selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
          selectedImageUrls: product.colourCollections[0]?.productImages || [], // Initialize with all images for the first color
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
    
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts();
  }
    
  disableImage(product: any,color:string): boolean {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor.productImages.length > 0) {
      return false;
    }else{
      return true;
    }
  }

  changeProductImage(product: any, color: string): void {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor) {
      product.selectedImageUrls = selectedColor.productImages; // Store all images for the selected color
      product.selectedColor = color;
    }
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
    const nextIndex = (currentIndex + 1) % product.selectedImageUrls.length; // Use selectedImageUrls array
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.selectedImageUrls[nextIndex];
  }

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) {
      clearInterval(this.hoverIntervals[key]);
    }
  }

  getAllSubCategory() {
    const productType = this.filters.productType;
    const gender = this.filters.gender;
    const clothing = this.filters.clothing;
  
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
