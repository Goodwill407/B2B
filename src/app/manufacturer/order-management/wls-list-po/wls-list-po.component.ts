import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';


@Component({
  selector: 'app-wls-list-po',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    TableModule,
    AccordionModule
  ],
  templateUrl: './wls-list-po.component.html',
  styleUrl: './wls-list-po.component.scss'
})
export class WlsListPoComponent {

  products: any[] = [];
  userProfile: any;

  constructor(public authService: AuthService,private router: Router, private communicationService: CommunicationService) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  getAllProducts(email: string) {
    const url = `/product-order/get-product-order/by-supplyer?supplierEmail=${email}`;
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
    distributor.grandTotal = (distributor.subTotal) + Number(distributor.gst);
  }

  placeOrder(distributor:any){
    this.router.navigate(['/wholesaler/place-order'], {
      queryParams: { productBy: distributor.products[0].productId.productBy, email:this.userProfile.email}
    });
  }
}
