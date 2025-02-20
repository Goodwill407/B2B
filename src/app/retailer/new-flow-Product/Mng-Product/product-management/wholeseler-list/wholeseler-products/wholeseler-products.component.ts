import { CommonModule, Location, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-wholeseler-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
  ],
  templateUrl: './wholeseler-products.component.html',
  styleUrl: './wholeseler-products.component.scss'
})
export class WholeselerProductsComponent {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: ''
  };

  products: any[] = [];
  allBrand: any;  
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allProductType:any[] = [];
  allcategory = [];
  allSubCategory = [];
 
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile: any;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;
  WholeselerEmail: any;
  CompanyName:any;
  wishlistItems: Set<string> = new Set();
  productUser:any='wholesaler';  // flag for wishlist 

  constructor(public authService: AuthService, private route:ActivatedRoute, private location: Location) { 
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.WholeselerEmail = params['email'];
      this.CompanyName = params['companyName'];
      if (this.WholeselerEmail) {
        this.getAllProducts();
      }
    })
    this.getAllBrands();
    this.getProductType();
    this.getWishlist();
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  applyFilters(): void {
    console.log('Filters applied:', this.filters);
  }


  getAllBrands() {
    this.authService.get(`brand`).subscribe((res: any) => {
      this.allBrand = res.results;
      console.log(res.results)
    });
  }
  
  getAllProducts() {
    // Construct the base URL with pagination parameters
    let url = `wholesaler-price-type2/filter/products`;
  
    // Initialize a filter object
    const filters: any = {};
  
    // Set filters based on the available selections
    if (this.filters.brand) {
      filters.brand = this.filters.brand;
    }
    if (this.filters.productType) {
      filters.productType = this.filters.productType;
    }
    if (this.filters.gender) {
      filters.gender = this.filters.gender;
    }
    if (this.filters.category) {
      filters.clothing = this.filters.category; // Assuming 'Category' is referring to 'clothing'
    }
    if (this.filters.subCategory) {
      filters.subCategory = this.filters.subCategory;
    }
    if (this.WholeselerEmail) {
      filters.wholesalerEmail = this.WholeselerEmail;
    }

    filters.limit=this.limit,
    filters.page=this.page
  
    // Make the API request
    this.authService.post(url, filters).subscribe(
      (res: any) => {
        if (res && res.products) {
          // Assign results and total count
          this.totalResults = res.total;
          this.products = res.products.map((product: any) => ({
            designNumber: product.designNumber,
            brand: product.brand,
            selectedImageUrl: product.colourCollections[0]?.productImages[0] || '', // Use first image
            selectedImageUrls: product.colourCollections[0]?.productImages || [], // Array of images
            productTitle: product.productTitle,
            productDescription: product.productDescription,
            selectedColor: product.colourCollections[0]?.colour || '', // Use first color
            colors: product.colourCollections.map((c: any) => c.colour), // Array of colors
            stock: product.quantity || 0, // Fallback to 0 if stock not available
            id: product.id,
            hoverIndex: 0 ,// To track which image is currently hovered over
            isInWishlist: this.wishlistItems.has(product.id),
          }));

          // Extract colors from images if no color information is available
          this.products.forEach((product) => {
            if (!product.selectedColor) {
              this.extractColorFromImage(product);
            }
          });
        }
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }
  

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts();
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

  // for master
  getProductType(){   
    this.authService.get(`producttype`).subscribe((res: any) => {
      this.allProductType = res.results;
    });
  }

  getCategoryByProductTypeAndGender(){
    const productType=this.filters.productType
    const gender=this.filters.gender

    this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`).subscribe((res:any)=>{
      if(res){
        this.allSubCategory=[]
      }
      this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category)));      
    },error=>{

    })
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

  

  WishlistAdd(id: string) {
    this.authService.post('type2-wishlist', { productId: id, email: this.userProfile.email, productOwnerEmail: this.WholeselerEmail, productUser:this.productUser }).subscribe(
      (res: any) => {
        console.log(res);
        
        this.wishlistItems.add(id); // Add product ID to wishlistItems set
        this.updateProductWishlistStatus(id, true); // Update product wishlist status
      },
      (err: any) => {
        console.log(err);
      }
    );
  }


  getWishlist() {
    this.authService.get(`type2-wishlist?email=${this.userProfile.email}&productOwnerEmail=${this.WholeselerEmail}`).subscribe(
      (res: any) => {
        if (res) {
          // Store the product IDs of wishlist items in a Set
          this.wishlistItems = new Set(res.results.map((item: any) => item.productId));
          this.getAllProducts(); // Fetch products after wishlist data is loaded
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  

  updateProductWishlistStatus(productId: string, isInWishlist: boolean) {
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      product.isInWishlist = isInWishlist; // Update the isInWishlist flag for the product
    }
  }

  navigateFun() {
    this.location.back();
  }

}
