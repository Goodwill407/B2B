import { CommonModule, Location, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

interface CartItem {
  _id: string;
  productId?: string;
  designNumber: string;
  colourName: string;
  colourImage: string;
  colour: string;
  size: string;
  price: number;
  mrp?: number;
  quantity: number;
  total?: number;
  brandName?: string;
  hsnCode?: string;
  hsnGst?: number;
}

interface ManufacturerCart {
  _id: string;
  manufacturerEmail: string;
  manufacturerName: string;
  items: CartItem[];
  totalQty: number;
  totalAmount: number;
  finalAmount: number;
  discount?: number;
  discountType?: string;
  commissionAmount?: number;
  gstAmount?: number;
  status: string;
}

interface CpCart {
  _id: string;
  id?: string;
  cpEmail: string;
  shopkeeperEmail: string;
  manufacturers: ManufacturerCart[];
  cartTotalQty: number;
  cartTotalAmount: number;
  cartFinalAmount: number;
  cartDiscount?: number;
  isDeleted?: boolean;
  status: string;
}

@Component({
  selector: 'app-cp-shopk-mfg-cart-list',
  standalone: true,
  imports: [
    CommonModule, NgIf, NgFor,
    FormsModule, RouterModule,
    TableModule, AccordionModule
  ],
  templateUrl: './cp-shopk-mfg-cart-list.component.html',
  styleUrl: './cp-shopk-mfg-cart-list.component.scss'
})
export class CpShopkMfgCartListComponent implements OnInit {

  cart: CpCart | null = null;
  shopkeeperEmail = '';
  shopkeeperName = '';
  loading = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.shopkeeperEmail = params['shopkeeperEmail'] || '';
      this.shopkeeperName  = params['shopkeeperName'] || 'Shopkeeper';
      if (this.shopkeeperEmail) {
        this.getCart();
      }
    });
  }

  getCart(): void {
    this.loading = true;
    this.authService.get(
      `cp-cart?cpEmail=${this.currentUser.email}&shopkeeperEmail=${this.shopkeeperEmail}`
    ).subscribe({
      next: (res: any) => {
        console.log('Raw API response:', JSON.stringify(res, null, 2));

        let cartData: any = null;

        // ── Handle both response shapes ──────────
        if (res?.results && Array.isArray(res.results)) {
          // Shape A: { results: [...] }
          cartData = res.results.find(
            (c: any) => c.shopkeeperEmail === this.shopkeeperEmail
          ) || res.results[0] || null;

        } else if (res?.shopkeeperEmail || res?.manufacturers) {
          // Shape B: cart object returned directly
          cartData = res;

        } else if (res?.data) {
          // Shape C: { data: {...} }
          cartData = res.data;
        }

        if (cartData) {
          cartData._id = cartData._id || cartData.id; // normalize
          this.cart = cartData;
          console.log('✅ Cart loaded, _id:', this.cart?._id);
          console.log('✅ Manufacturers count:', this.cart?.manufacturers?.length);
        } else {
          this.cart = null;
          console.warn('⚠️ No cart found in response');
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Cart API error:', err);
        this.loading = false;
        this.cart = null;
        this.communicationService.customError1('Unable to load cart');
      }
    });
  }

  getCartId(): string {
    return this.cart?._id || this.cart?.id || '';
  }

  getTotalQty(mfg: ManufacturerCart): number {
    return mfg.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  getTotalAmount(mfg: ManufacturerCart): number {
    return mfg.items.reduce((sum, i) => sum + (i.quantity * +i.price), 0);
  }

  handleImageError(event: any, item: CartItem): void {
    item.colourImage = '';
    event.target.style.display = 'none';
  }

  onEdit(item: CartItem, mfg: ManufacturerCart): void {
    const cartId = this.getCartId();

    Swal.fire({
      title: `Edit Quantity — ${item.designNumber}`,
      html: `
        <div style="text-align:left;">
          <p><strong>Colour:</strong> ${item.colourName}</p>
          <p><strong>Size:</strong> ${item.size}</p>
          <p><strong>Rate:</strong> ₹${item.price}</p>
          <p><strong>Current Qty:</strong> ${item.quantity}</p>
          <input id="swal-qty" type="number" min="1" class="swal2-input"
            placeholder="Enter new quantity" value="${item.quantity}" />
        </div>
      `,
      imageUrl: item.colourImage || undefined,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        const val = parseInt(
          (document.getElementById('swal-qty') as HTMLInputElement).value, 10
        );
        if (!val || val < 1) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return;
        }
        return val;
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const payload = {
          cartId: cartId,
          manufacturerEmail: mfg.manufacturerEmail,
          itemId: item._id,
          quantity: result.value
        };
        this.authService.patchpimage('cp-cart/item', payload).subscribe({
          next: () => {
            item.quantity = result.value;
            Swal.fire('Updated!', 'Quantity updated.', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to update.', 'error')
        });
      }
    });
  }

  onDelete(item: CartItem, mfg: ManufacturerCart): void {
    const cartId = this.getCartId();

    Swal.fire({
      title: 'Delete this item?',
      html: `
        <div style="text-align:left;">
          <p><strong>Design No:</strong> ${item.designNumber}</p>
          <p><strong>Colour:</strong> ${item.colourName}</p>
          <p><strong>Size:</strong> ${item.size}</p>
          <p><strong>Qty:</strong> ${item.quantity}</p>
        </div>
      `,
      imageUrl: item.colourImage || undefined,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        const payload = {
          cartId: cartId,
          manufacturerEmail: mfg.manufacturerEmail,
          itemId: item._id
        };
        this.authService.delete2WithBody('cp-cart/item', payload).subscribe({
          next: () => {
            mfg.items = mfg.items.filter(i => i._id !== item._id);
            Swal.fire('Deleted!', 'Item removed.', 'success');
          },
          error: () => Swal.fire('Error', 'Failed to delete.', 'error')
        });
      }
    });
  }

  onDeleteMfgCart(mfg: ManufacturerCart): void {
  const cartId = this.getCartId();

  Swal.fire({
    title: 'Remove all items?',
    html: `Remove entire cart for <strong>${mfg.manufacturerName}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete all!'
  }).then(result => {
    if (result.isConfirmed) {
      const payload = {
        cartId: cartId,
        manufacturerEmail: mfg.manufacturerEmail
      };

      // ← Use dedicated bulk delete API instead of item loop
      this.authService.delete2WithBody(
        'cp-cart/single-manufacturer-cart', payload
      ).subscribe({
        next: (res: any) => {
          // API returns updated cart — sync it
          if (res?.data) {
            const updated = res.data;
            updated._id = updated._id || updated.id;
            this.cart = updated;
          } else {
            // fallback — remove locally
            if (this.cart) {
              this.cart.manufacturers = this.cart.manufacturers.filter(
                m => m.manufacturerEmail !== mfg.manufacturerEmail
              );
            }
          }
          Swal.fire('Deleted!', 'Manufacturer cart removed.', 'success');
        },
        error: () => Swal.fire('Error', 'Could not delete.', 'error')
      });
    }
  });
}

  placeOrder(mfg: ManufacturerCart): void {
    const cartId = this.getCartId();

    if (!cartId) {
      this.communicationService.customError1('Cart ID not found. Please reload.');
      return;
    }

    this.router.navigate(['/cp/cp-shopk-mfg-gen-po'], {
      queryParams: {
        cartId: cartId,
        manufacturerId: mfg._id,
        manufacturerEmail: mfg.manufacturerEmail,
        manufacturerName: mfg.manufacturerName,
        shopkeeperEmail: this.shopkeeperEmail,
        shopkeeperName: this.shopkeeperName
      }
    });
  }

  navigateFun(): void {
    this.location.back();
  }
}