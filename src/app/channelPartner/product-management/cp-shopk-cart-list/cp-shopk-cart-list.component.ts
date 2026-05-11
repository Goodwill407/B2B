import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import Swal from 'sweetalert2';

interface ShopkeeperCart {
  shopkeeperEmail: string;
  shopkeeperName?: string;
  shopName?: string;
  city?: string;
  state?: string;
  profileImg?: string;
  cartTotalQty: number;
  cartFinalAmount: number;
  manufacturerCount: number;
  status: string;
  cartId: string; 
}

@Component({
  selector: 'app-cp-shopk-cart-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './cp-shopk-cart-list.component.html',
  styleUrl: './cp-shopk-cart-list.component.scss'
})
export class CpShopkCartListComponent implements OnInit {

  shopkeeperCarts: ShopkeeperCart[] = [];
  loading = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.getShopkeeperCarts();
  }

  getShopkeeperCarts(): void {
  if (!this.currentUser?.email) return;
  this.loading = true;

  this.authService.get(`cp-cart/shopkeepers?cpEmail=${this.currentUser.email}`).subscribe({
    next: (res: any) => {
      const raw: any[] = res?.results || [];

      // Filter out empty carts (cartTotalQty === 0)
      this.shopkeeperCarts = raw
        .filter(cart => cart.cartTotalQty > 0)
        .map(cart => ({
          shopkeeperEmail: cart.shopkeeperEmail,
          shopkeeperName: cart.shopkeeperEmail.split('@')[0],  // fallback until profile API
          cartTotalQty: cart.cartTotalQty,
          cartFinalAmount: cart.cartFinalAmount,
          cartTotalAmount: cart.cartTotalAmount,
          manufacturerCount: cart.manufacturers?.length || 0,
          status: cart.status,
          cartId: cart.id   // ← store cart._id for delete
        }));

      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.shopkeeperCarts = [];
      this.communicationService.customError1('Unable to load shopkeeper carts');
    }
  });
}

  getInitial(name: string): string {
    return (name || 'S')[0].toUpperCase();
  }

  openCart(sk: ShopkeeperCart): void {
    this.router.navigate(['/cp/cp-shopk-mfg-cart-list'], {
      queryParams: {
        shopkeeperEmail: sk.shopkeeperEmail,
        shopkeeperName: sk.shopkeeperName || sk.shopName || 'Shopkeeper'
      }
    });
  }

  onDeleteCart(event: Event, sk: ShopkeeperCart): void {
  event.stopPropagation(); // prevent card click navigation

  Swal.fire({
    title: 'Delete this cart?',
    html: `Remove all items for <strong>${sk.shopkeeperName || sk.shopkeeperEmail}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then(result => {
    if (result.isConfirmed) {
      this.authService.delete2(`cp-cart/${sk.cartId}`).subscribe({
        next: () => {
          this.shopkeeperCarts = this.shopkeeperCarts.filter(
            c => c.cartId !== sk.cartId
          );
          Swal.fire('Deleted!', 'Cart has been removed.', 'success');
        },
        error: () => Swal.fire('Error', 'Could not delete cart.', 'error')
      });
    }
  });
}
}