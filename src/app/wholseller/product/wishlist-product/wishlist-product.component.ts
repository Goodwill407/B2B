import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-wishlist-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './wishlist-product.component.html',
  styleUrl: './wishlist-product.component.scss'
})
export class WishlistProductComponent {

  products: any[] = [];
 
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile: any;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;

  constructor(public authService: AuthService, private route: ActivatedRoute,private communicationService:CommunicationService) { }

  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';
  
  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.getAllProducts(this.userProfile.email);
  }



  getAllProducts(email: any) {
    let url = `wishlist/get/wishlist/${email}`;

    this.authService.get(url).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.map((product: any) => ({
          designNo: product.designNumber,
          selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
          selectedImageUrls: product.colourCollections[0]?.productImages || [], // Initialize with all images for the first color
          title: product.productTitle,
          brand: product.brand,
          createdAt: product.createdAt,
          manufactureName: product.manufactureName,
          description: product.productDescription,
          selectedColor: product.colourCollections[0]?.colour || '',
          colors: product.colourCollections.map((c: any) => c.colour),
          colourCollections: product.colourCollections,
          stock: product.quantity, // Replace with actual stock value if available
          id: product.wishlistId,
          productId: product._id,
          productBy: product.productBy,
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
    this.getAllProducts(this.userProfile.email);
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

  deleteWishlistItem(item: any) {
    this.authService.delete('wishlist', item).subscribe((res: any) => {
      this.getAllProducts(this.userProfile.email);
      this.communicationService.showNotification('snackbar-success','Product Removed From Wishlist','bottom','center');
    })
  }

  addToCart(data: any) {
    const cartBody = {
    "email": this.userProfile.email,
    "productBy": data.productBy,
    "productId": data.id,
    "quantity": 1
    }

    this.authService.post('cart', cartBody).subscribe((res: any) => {
      this.communicationService.showNotification('snackbar-success','Product Successfully Added in Cart','bottom','center');
    },
    (error) => {
      this.communicationService.showNotification('snackbar-error', error.error.message, 'bottom', 'center');
    }
  )
  }

}

