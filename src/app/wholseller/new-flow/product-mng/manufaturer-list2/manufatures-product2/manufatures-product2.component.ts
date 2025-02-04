import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-manufatures-product2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    NgStyle,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './manufatures-product2.component.html',
  styleUrls: ['./manufatures-product2.component.scss']
})
export class ManufaturesProduct2Component {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: '',
  };

  products: any[] = [];
  allBrand: any;
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allProductType = [];
  allClothingType = [];
  allSubCategory = [];
  wishlist: boolean = false;
  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  userProfile: any;
  mnfCompanyName:any;
  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;
  mnfEmail: any;
  wishlistItems: Set<string> = new Set(); // Set to store wishlist product IDs

  constructor(public authService: AuthService, private route: ActivatedRoute) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.mnfEmail = params['email'];
      this.mnfCompanyName = params['CompanyName'];
      if (this.mnfEmail) {
        this.getAllProducts(this.mnfEmail);
      }
    });
    this.getAllBrands();
    this.getWishlist(); // Fetch the wishlist items when component initializes
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  applyFilters(): void {
    console.log('Filters applied:', this.filters);
  }

  getAllBrands() {
    this.authService.get(`brand?brandOwner=${this.mnfEmail}`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getAllProducts(email: any) {
    let url = `type2-products/filter-products?limit=${this.limit}&page=${this.page}`;

    const Object = {
      productBy: email,
      brand: this.filters.brand,
      productType: this.filters.productType,
      gender: this.filters.gender,
      clothing: this.filters.category,
      subCategory: this.filters.subCategory,
    };

    this.authService.post(url, Object).subscribe(
      (res: any) => {
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
            hoverIndex: 0,
            isInWishlist: this.wishlistItems.has(product.id), // Set wishlist status
          }));

          this.products.forEach((product) => {
            if (!product.selectedColor) {
              this.extractColorFromImage(product);
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  WishlistAdd(id: string) {
    this.authService.post('type2-wishlist', { productId: id, email: this.userProfile.email }).subscribe(
      (res: any) => {
        this.wishlistItems.add(id); // Add product ID to wishlistItems set
        this.updateProductWishlistStatus(id, true); // Update product wishlist status
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  

  // Fetch the current user's wishlist items
  getWishlist() {
    this.authService.get(`type2-wishlist?email=${this.userProfile.email}`).subscribe(
      (res: any) => {
        if (res) {
          // Store the product IDs of wishlist items in a Set
          this.wishlistItems = new Set(res.results.map((item: any) => item.productId));
          this.getAllProducts(this.mnfEmail); // Fetch products after wishlist data is loaded
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // Update the wishlist status of a product
  updateProductWishlistStatus(productId: string, isInWishlist: boolean) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      product.isInWishlist = isInWishlist; // Update the isInWishlist flag for the product
    }
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts(this.mnfEmail);
  }

  extractColorFromImage(product: any): void {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = product.selectedImageUrl;

    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image);
      product.selectedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.changeProductImage(product, product.selectedColor);
    };
  }

  disableImage(product: any, color: string): boolean {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor.productImages.length > 0) {
      return false;
    } else {
      return true;
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

  getAllSubCategory() {
    const productType = this.filters.productType;
    const gender = this.filters.gender;
    const clothing = this.filters.category;

    let url = 'sub-category';

    if (productType) {
      url += `?productType=${productType}`;
    }
    if (gender) {
      url += url.includes('?') ? '&' : '?' + `gender=${gender}`;
    }
    if (clothing) {
      url += url.includes('?') ? '&' : '?' + `clothing=${clothing}`;
    }

    this.authService.get(url).subscribe(
      (res) => {
        if (res) {
          this.allProductType = Array.from(new Set(res.results.map((item: any) => item.productType)));
          this.allClothingType = Array.from(new Set(res.results.map((item: any) => item.category)));
          this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
