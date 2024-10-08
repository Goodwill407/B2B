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
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile: any;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;

  constructor(public authService: AuthService) { 
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.getAllBrands();   
    this.getAllProducts();
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  applyFilters(): void {
    console.log('Filters applied:', this.filters);
  }

  getAllBrands() {
    this.authService.get(`brand?brandOwner=${this.userProfile.email}`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }


  getCategoryByProductTypeAndGender() {
    const productType=this.filters.productType
    const gender=this.filters.gender

    this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`).subscribe((res: any) => {
      if (res) {
        this.allSubCategory = []
      }
      this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category)));
    }, error => {

    });
     }
  
  getSubCategoryBYProductType_Gender_and_Category(){
    const productType = this.filters.productType;
    const gender = this.filters.gender;
    const category = this.filters.category;
    const object=
      {
        "productType":productType ,
        "gender":gender ,
        "category":category ,     
      }
   

    this.authService.post(`sub-category/filter`,object).subscribe((res: any) => {
      if (res) {
        this.allSubCategory = []
      }
      this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
    }, error => {

    });   
  }
  
  getAllProducts() {
    let url = `type2-products/filter-products?limit=${this.limit}&page=${this.page}`;
   
    const Object={
      "productBy": this.userProfile.email,
      "brand":this.filters.brand,
      "productType":this.filters.productType,
      "gender": this.filters.gender,
      "clothing": this.filters.category,
      "subCategory":this.filters.subCategory
    }

   

    this.authService.post(url,Object).subscribe((res: any) => {
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
          // stock: product.quantity || 2000, // Replace with actual stock value if available
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
    image.src = this.authService.cdnPath + (product.selectedImageUrl||'/b2b/1727183682898-no-image.png');

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
    const nextIndex = (currentIndex + 1) % product.selectedImageUrls.length; // Use selectedImageUrls array
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.selectedImageUrls[nextIndex];
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

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) {
      clearInterval(this.hoverIntervals[key]);
    }
  }

  

  

  // Implement other methods like getAllProducts, getAllSubCategory, etc.

  shareOnFacebook(product: any) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.getProductUrl(product))}`;
    window.open(url, '_blank');
  }

  shareOnWhatsApp(product: any) {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(this.getProductUrl(product))}`;
    window.open(url, '_blank');
  }

  // shareOnInstagram(product: any) {
  //   // Instagram does not have a direct sharing URL, you might need to use their API or a different approach
  //   alert('Share on Instagram');
  // }

  shareOnTwitter(product: any) {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(this.getProductUrl(product))}`;
    window.open(url, '_blank');
  }

  getProductUrl(product: any): string {
    return `http://fashiontradershub.com`; // Change to your actual product URL
  }  

  // Method to return truncated description
  // getTruncatedDescription(description: string, limit: number): string {
  //   return description.length > limit ? description.substring(0, 5) + '...' : description;
  // }


}


