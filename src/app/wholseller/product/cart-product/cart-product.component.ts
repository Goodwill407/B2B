import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-cart-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    TableModule
  ],
  templateUrl: './cart-product.component.html',
  styleUrls: ['./cart-product.component.scss']
})
export class CartProductComponent implements OnInit {
  products: any[] = [];
  userProfile: any;

  constructor(public authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService) {}

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

  deleteProduct(item: any) {
    this.authService.delete('cart', item).subscribe((res: any) => {
      this.getAllProducts(this.userProfile.email);
      this.communicationService.showNotification('snackbar-success', 'Product Removed From Wishlist', 'bottom', 'center');
    });
  }

  updateQuantity(event: any, distributor: any, product: any): void {
    const quantity = event.target.value;
    this.authService.patchWithEmail(`cart/update/cart?email=${distributor.email}&productId=${product.productId.id}&quantity=${quantity}`, {})
      .subscribe((res: any) => {
        product.quantity = quantity;
        this.updateTotals(distributor);
        this.communicationService.showNotification('snackbar-success', 'Product Quantity Updated', 'bottom', 'center');
      }, error => {
        console.log(error);
      });
  }

  updateTotals(distributor: any): void {
    distributor.subTotal = distributor.products.reduce((sum: number, product: any) => sum + (product.quantity * product.productId.MRP), 0);
    distributor.gst = distributor.subTotal * 0.18;
    distributor.grandTotal = distributor.subTotal + distributor.gst;
  }
}
