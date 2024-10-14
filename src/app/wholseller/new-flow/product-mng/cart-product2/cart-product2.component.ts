import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-cart-product2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    AccordionModule
  ],
  templateUrl: './cart-product2.component.html',
  styleUrl: './cart-product2.component.scss'
})
export class CartProduct2Component {
  products: any[] = [];
  userProfile: any;

  constructor(public authService: AuthService, private router: Router, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  getAllProducts(email: string) {
    const url = `type2-cart?email=${email}`;
    this.authService.get(url).subscribe((res: any) => {
      if (res && res.results) {
        this.products = res.results;

   
      }
    }, error => {
      console.log(error);
    });
  }
  
  calculateSubTotal(product: any) {
    let subTotal = 0;

    // Iterate over each size to calculate the subtotal based on quantity and price
    product.sizes.forEach((size: any) => {
      subTotal += size.quantity * size.price;
    });

    return subTotal;
  }

 

 
  placeOrder(distributor: any) {
    this.router.navigate(['/wholesaler/order-mng/place-order'], {
      queryParams: { productBy: distributor.products[0].productId.productBy, email: this.userProfile.email }
    });
  }
}
