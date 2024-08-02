import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-cart-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './cart-product.component.html',
  styleUrl: './cart-product.component.scss'
})
export class CartProductComponent {

  products: any[] = [];


  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  userProfile: any;

  hoverIntervals: any = {}; // Track hover intervals for each product
  totalResults: any;

  constructor(public authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.getAllProducts(this.userProfile.email);
  }

  getAllProducts(email: any) {
    let url = `cart/cart-products/${email}`;
  
    this.authService.get(url).subscribe((res: any) => {
      if (res) {
        this.products = res.map((item: any) => {
          const product = item.products[0].productId;
          return {
            designNo: product.designNumber,
            selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
            selectedImageUrls: product.colourCollections[0]?.productImages || [],
            title: product.productTitle,
            brand: product.brand,
            createdAt: product.createdAt,
            manufactureName: product.manufactureName,
            description: product.productDescription,
            selectedColor: product.colourCollections[0]?.colour || '',
            colors: product.colourCollections.map((c: any) => c.colour),
            colourCollections: product.colourCollections,
            stock: item.quantity, // Use quantity from item.products
            id: item._id,
            productBy: product.productBy,
            hoverIndex: 0,
            price: product.MRP,
            mrp: product.MRP // Adjust as necessary for pricing details
          };
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

  deleteProduct(item: any) {
    this.authService.delete('wishlist', item).subscribe((res: any) => {
      this.getAllProducts(this.userProfile.email);
      this.communicationService.showNotification('snackbar-success', 'Product Removed From Wishlist', 'bottom', 'center');
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
      this.communicationService.showNotification('snackbar-success', 'Product Successfully Added in Cart', 'bottom', 'center');
    },
      (error) => {
        this.communicationService.showNotification('snackbar-error', error.error.message, 'bottom', 'center');
      }
    )
  }

}


