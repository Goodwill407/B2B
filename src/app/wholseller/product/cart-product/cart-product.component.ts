import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-cart-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    TableModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent,
    AccordionModule
  ],
  templateUrl: './cart-product.component.html',
  styleUrls: ['./cart-product.component.scss']
})
export class CartProductComponent implements OnInit {
  products: any[] = [];
  userProfile: any;

   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://5.imimg.com/data5/QE/UV/YB/SELLER-56975382/i-will-create-10-sizes-html5-creative-banner-ads.jpg';

  constructor(public authService: AuthService,private router: Router, private communicationService: CommunicationService) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  getAllProducts(email: string) {
    const url = `cart/cart-products/${email}`;
    this.authService.get(url).subscribe((res: any) => {
      if (res) {
        this.products = res;
        this.products.forEach(distributor => this.updateTotals(distributor));
      }
    }, error => {
      console.log(error);
    });
  }

  deleteProduct(item: any, distributor: any) {
    this.authService.deleteWithEmail(`cart/delete/cart?email=${this.userProfile.email}&productId=${item}`).subscribe((res: any) => {
      this.getAllProducts(this.userProfile.email);
      this.communicationService.showNotification('snackbar-success', 'Product Removed From Cart', 'bottom', 'center');
    });
  }

  updateQuantity(event: any, distributor: any, product: any): void {
    const quantity = event.target.value;
    this.authService.patchWithEmail(`cart/update/cart?email=${this.userProfile.email}&productId=${product.productId.id}&quantity=${quantity}`, {})
      .subscribe((res: any) => {
        product.quantity = quantity;
        this.updateTotals(distributor);
        this.communicationService.showNotification('snackbar-success', 'Product Quantity Updated', 'bottom', 'center');
      }, error => {
        console.log(error);
      });
  }

  updateTotals(distributor: any): void {
    distributor.subTotal = distributor.products.reduce((sum: number, product: any) => sum + (product.quantity * product.productId.setOfManPrice), 0);
    distributor.gst = (distributor.subTotal * 0.18).toFixed(2);
    distributor.grandTotal = ((distributor.subTotal) + Number(distributor.gst)).toFixed(2);
  }

  placeOrder(distributor:any){
    this.router.navigate(['/wholesaler/order-mng/place-order'], {
      queryParams: { productBy: distributor.products[0].productId.productBy, email:this.userProfile.email}
    });
  }
}
