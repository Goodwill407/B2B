import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';
import { IndianCurrencyPipe } from 'app/custom.pipe';
interface PriceHeaders {
  [wholesaler: string]: {
      [designNumber: string]: {
          [size: string]: number;
      };
  };
}


// Interface Definitions
interface ProductSet {
  _id: any;
  productBy: string;
  colourName: string;
  colourImage: string;
  colour: string;
  quantity: number;
  size: string;
  price: number;
  designNumber: string;
}

interface manufacturer {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  profileImg: string;
  GSTIN: string;
}

interface Product {
  _id: string;
  set: ProductSet[];
  email: string;
  wholesalerEmail: string;
  productBy: string;
  cartAddedDate: string;
  manufacturer: manufacturer;
  groupedProducts?: any[];
}
@Component({
  selector: 'app-cart-product2-retailer-man',
  standalone: true,
  imports: [ CommonModule,
      FormsModule,
      RouterModule,
      TableModule,
      AccordionModule,
      BottomSideAdvertiseComponent,
      IndianCurrencyPipe  ],
  templateUrl: './cart-product2-retailer-man.component.html',
  styleUrl: './cart-product2-retailer-man.component.scss'
})
export class CartProduct2RetailerManComponent {
 products: Product[] = [];
  userProfile: any;
  sizeHeaders: string[] = [];
  priceHeaders: PriceHeaders = {};
  wholesalerTotals: {
    [wholesaler: string]: {
      subtotal: number;
      gst: number;
      grandTotal: number;
      sgst?: number; // Optional property for SGST
      cgst?: number; // Optional property for CGST
      igst?: number; // Optional property for IGST
    };
  } = {};

  bottomAdImage: string[] = ['assets/images/adv/ads2.jpg', 'assets/images/adv/ads.jpg'];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
  }

  // getAllProducts(email: string): void {
  //   const url = `rtl-toMnf-cart?email=${email}`;
  //   this.authService.get(url).subscribe(
  //     (res: { results: Product[] }) => {
  //       console.log(res);
  //       if (res?.results) {
  //         this.products = res.results.map((product: Product) => {
  //           product.groupedProducts = this.processGroupedProducts(product.set, product.manufacturer.fullName); // Group products
  //           return product;
  //         });
  //         this.extractSizesAndPrices(this.products); // Extract sizes and prices
  //       }
  //     },
  //     (error) => console.error(error)
  //   );
  // }

  getAllProducts(email: string): void {
    const url = `rtl-toMnf-cart?email=${email}`;
    this.authService.get(url).subscribe({
      next: (res: { results: Product[] }) => {
        this.products = res.results.map((product: Product) => {
          product.set = product.set.map((item: any, index: number) => {
            if (!item._id) {
              // Fallback: create a synthetic _id if missing
              item._id = `${item.designNumber}-${item.size}-${index}`;
            }
            return item;
          });
          return product;
        });
      },
      error: (err) => console.error(err)
    });
  }
  

  getTotalQuantity(prod: Product): number {
    return prod.set.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalAmount(prod: Product): number {
    return prod.set.reduce((sum, item) => sum + item.quantity * +item.price, 0);
  }

  onEdit(item: ProductSet, cartId: string): void {
    Swal.fire({
      title: `Edit Quantity - ${item.designNumber}`,
      html: `
        <div style="text-align: left;">
          <p>Colour: ${item.colourName}</p>
          <p>Size: ${item.size}</p>
          <p>Rate: ₹${item.price}</p>
          <p>Current Quantity: ${item.quantity}</p>
          <input id="swal-qty" type="number" min="1" class="swal2-input" placeholder="Enter new quantity" value="${item.quantity}" />
        </div>
      `,
      imageUrl: item.colourImage,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: () => {
        const newQty = parseInt((document.getElementById('swal-qty') as HTMLInputElement).value, 10);
        if (!newQty || newQty < 1) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return;
        }
        return newQty;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value !== undefined) {
        const newQuantity = result.value;
        console.log(cartId);
        console.log(item._id);
        const url = `rtl-toMnf-cart/updatecart/${cartId}/set/${item._id}`;
        const payload = { quantity: newQuantity };

        this.authService.patchpimage(url, payload).subscribe({
          next: () => {
            item.quantity = newQuantity;
            Swal.fire('Updated!', 'Quantity has been updated.', 'success');
          },
          error: (err) => {
            console.error('Update failed', err);
            Swal.fire('Error', 'Failed to update quantity.', 'error');
          }
        });
      }
    });
  }

  onDelete(item: ProductSet, cartId: string): void {
    Swal.fire({
      title: 'Are you sure you want to delete this item?',
      html: `
        <div style="text-align: left;">
          <p><strong>Design No:</strong> ${item.designNumber}</p>
          <p><strong>Colour:</strong> ${item.colourName}</p>
          <p><strong>Size:</strong> ${item.size}</p>
          <p><strong>Rate:</strong> ₹${item.price}</p>
          <p><strong>Quantity:</strong> ${item.quantity}</p>
        </div>
      `,
      imageUrl: item.colourImage,
      imageWidth: 80,
      imageHeight: 90,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `rtl-toMnf-cart/${cartId}/set/${item._id}`;

        this.authService.delete2(url).subscribe({
          next: () => {
            const cart = this.products.find(p => p._id === cartId);
            if (cart) {
              cart.set = cart.set.filter(s => s._id !== item._id);
            }

            Swal.fire('Deleted!', 'Item has been removed from the cart.', 'success');
          },
          error: (err) => {
            console.error('Delete failed', err);
            Swal.fire('Error', 'Failed to delete the item.', 'error');
          }
        });
      }
    });
  }

  confirmDeleteCart(prod: Product): void {
    Swal.fire({
      title: 'Are you sure?',
      html: `<div style="text-align:left;">
               This will remove all items from <strong>${prod.manufacturer.fullName}</strong>'s cart.
             </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const url = `rtl-toMnf-cart/${prod._id}`;
        this.authService.delete2(url).subscribe({
          next: () => {
            this.products = this.products.filter(p => p._id !== prod._id);
            Swal.fire('Deleted!', 'The cart has been removed.', 'success');
          },
          error: (err) => {
            console.error('Deletion failed', err);
            Swal.fire('Error', 'Could not delete the cart.', 'error');
          }
        });
      }
    });
  }

  extractSizesAndPrices(products: Product[]): void {
    const sizeHeadersSet = new Set<string>();
    const priceHeaders: {
        [wholesaler: string]: {
            [designNumber: string]: {
                [size: string]: number;
            };
        };
    } = {};

    products.forEach((product) => {
        const wholesaler = product.manufacturer?.fullName;
        if (!wholesaler) {
            console.error('Wholesaler missing for product:', product);
            return;
        }

        if (!priceHeaders[wholesaler]) {
            priceHeaders[wholesaler] = {};
        }

        product.set.forEach((productSet) => {
            const { size, price, designNumber } = productSet;

            sizeHeadersSet.add(size); // Collect all unique sizes

            if (!priceHeaders[wholesaler][designNumber]) {
                priceHeaders[wholesaler][designNumber] = {};
            }

            priceHeaders[wholesaler][designNumber][size] = parseFloat(price.toString());
        });
    });

    this.sizeHeaders = Array.from(sizeHeadersSet).sort(); // Sorted sizes for consistent display
    this.priceHeaders = priceHeaders;

    // Debugging: Log priceHeaders
    console.log('Price Headers:', this.priceHeaders);
}



processGroupedProducts(productSet: ProductSet[], wholesalerName: string): any[] {
  const grouped: any = {};
  let wholesalerSubtotal = 0;

  productSet.forEach((product) => {
      const key = product.designNumber;
      if (!grouped[key]) {
          grouped[key] = { designNumber: key, rows: [], subTotal: 0 };
      }

      let row = grouped[key].rows.find((r: any) => r.colourName === product.colourName);
      if (!row) {
          row = { colourName: product.colourName, quantities: {}, totalPrice: 0 };
          grouped[key].rows.push(row);
      }

      row.quantities[product.size] = (row.quantities[product.size] || 0) + product.quantity;
      row.totalPrice += product.price * product.quantity;

      wholesalerSubtotal += product.price * product.quantity;
  });

  // Determine GST based on state matching
  const isStateMatch = this.isStateMatch(wholesalerName);
  const gstDetails = this.calculateGSTDetails(wholesalerSubtotal, isStateMatch);

  // Save totals for this wholesaler
  this.wholesalerTotals[wholesalerName] = {
      subtotal: wholesalerSubtotal,
      ...gstDetails // Spread GST and total details
  };

  return Object.values(grouped);
}

isStateMatch(wholesalerName: string): boolean {
  const wholesalerState = this.products.find(p => p.manufacturer.fullName === wholesalerName)?.manufacturer.state;
  return wholesalerState === this.userProfile.state; // Compare wholesaler's state with retailer's state
}

calculateGSTDetails(subtotal: number, isStateMatch: boolean) {
  if (isStateMatch) {
      const sgst = parseFloat((subtotal * 0.09).toFixed(2)); // 9% SGST
      const cgst = parseFloat((subtotal * 0.09).toFixed(2)); // 9% CGST
      return {
          sgst,
          cgst,
          gst: sgst + cgst,
          grandTotal: parseFloat((subtotal + sgst + cgst).toFixed(2))
      };
  } else {
      const igst = parseFloat((subtotal * 0.18).toFixed(2)); // 18% IGST
      return {
          igst,
          gst: igst,
          grandTotal: parseFloat((subtotal + igst).toFixed(2))
      };
  }
}

placeOrder(prod: Product): void {
  this.router.navigate(['/retailer/new/genpoMan', prod.email, prod.productBy]);
}


}
