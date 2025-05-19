  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { Router, RouterModule } from '@angular/router';
  import { AuthService, CommunicationService } from '@core';
  import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
  import { AccordionModule } from 'primeng/accordion';
  import { TableModule } from 'primeng/table';
  import Swal from 'sweetalert2';
  @Component({
    selector: 'app-cart-product2',
    standalone: true,
    templateUrl: './cart-product2.component.html',
    styleUrls: ['./cart-product2.component.scss'],
    imports: [
      CommonModule,
      FormsModule,
      RouterModule,
      TableModule,
      AccordionModule,
      BottomSideAdvertiseComponent
    ],
  })
  export class CartProduct2Component {
    products: any[] = [];
    processedProducts: any[] = [];
    userProfile: any;
    sizeHeaders: string[] = [];
    priceHeaders: { [size: string]: number } = {};
    bottomAdImage: string[] = ['assets/images/adv/ads2.jpg', 'assets/images/adv/ads.jpg'];
  
    constructor(
      public authService: AuthService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      if (this.userProfile && this.userProfile.email) {
        this.getAllProducts(this.userProfile.email);
      }
    }
  
    getAllProducts(email: string): void {
      const url = `type2-cart?email=${email}`;
      this.authService.get(url).subscribe(
        (res: any) => {
          if (res && res.results) {
            this.products = res.results;
            // this.processData();
          }
        },
        (error) => console.error(error)
      );
    }
  
    onEdit(item: any, cartId: string): void {
      Swal.fire({
        title: `Edit Quantity - ${item.designNumber}`,
        html: `
          <div style="text-align: left;">
            <p><strong>Colour:</strong> ${item.colourName}</p>
            <p><strong>Size:</strong> ${item.size}</p>
            <p><strong>Rate:</strong> ₹${item.price}</p>
            <p><strong>Current Quantity:</strong> ${item.quantity}</p>
            <input id="swal-qty" type="number" min="1" class="swal2-input" placeholder="Enter new quantity" value="${item.quantity}" />
          </div>
        `,
        imageUrl: item.colourImage,
        imageWidth: 80,
        showCancelButton: true,
        confirmButtonText: 'Update',
        preConfirm: () => {
          const qtyInput = (document.getElementById('swal-qty') as HTMLInputElement).value;
          const newQty = Number(qtyInput);
          if (!newQty || newQty < 1) {
            Swal.showValidationMessage('Please enter a valid quantity.');
            return;
          }
          return newQty;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const updatedQuantity = result.value;
          const url = `/type2-cart/updatecart/${cartId}/set/${item._id}`;
    
          this.authService.patchpimage(url, { quantity: updatedQuantity }).subscribe({
            next: () => {
              item.quantity = updatedQuantity; // Update UI locally
              Swal.fire('Updated!', 'Quantity has been updated.', 'success');
            },
            error: () => {
              Swal.fire('Error', 'Failed to update quantity. Try again later.', 'error');
            }
          });
        }
      });
    }
    
    onDelete(item: any, cartId: string): void {
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
          const url = `type2-cart/${cartId}/set/${item._id}`;
    
          this.authService.delete2(url).subscribe({
            next: () => {
              // Remove item from the UI
              const cart = this.products.find(p => p._id === cartId);
              if (cart) {
                cart.set = cart.set.filter((s: { _id: any; }) => s._id !== item._id);
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
    
    confirmDeleteCart(prod: any): void {
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
          const url = `type2-cart/${prod._id}`;
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

    getGroupedTotalQuantity(groups: any[]): number {
      return groups?.reduce((total, group) => {
        return total + group.rows.reduce((sum: number, row: any) => {
          return sum + Object.values(row.quantities as Record<string, number>).reduce((a, b) => a + (b || 0), 0);
        }, 0);
      }, 0) || 0;
    }
    
    
    getGroupedTotalAmount(groups: any[]): number {
      return groups?.reduce((total, group) => {
        return total + group.rows.reduce((sum: number, row: any) => sum + (row.totalPrice || 0), 0);
      }, 0) || 0;
    }
    
    
    getTotalQuantity(prod: any): number {
      return prod.set.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0);
    }
    
    getTotalAmount(prod: any): number {
      return prod.set.reduce((sum: number, item: { quantity: number; price: number; }) => sum + item.quantity * item.price, 0);
    }
    
    getAccordionHeader(prod: any): string {
      const totalQty = this.getTotalQuantity(prod);
      const totalAmt = this.getTotalAmount(prod);
      const formattedQty = totalQty.toLocaleString('en-IN');
      const formattedAmt = totalAmt.toLocaleString('en-IN', {  maximumFractionDigits: 2 });
    
      return `${prod.wholesaler.fullName} — Total Items: ${formattedQty} | Total Amount ₹${formattedAmt}`;
    }
    
    // processData(): void {
    //   // Process each product and precompute grouped data
    //   this.processedProducts = this.products.map((prod) => {
    //     const groupedProducts = this.groupProductsByDesign(prod.set);
    //     this.extractSizesAndPrices(prod.set);
    //     const totals = this.calculateTotals(groupedProducts);
  
    //     return {
    //       ...prod,
    //       groupedProducts,
    //       totals,
    //     };
    //   });
    // }
  
    // groupProductsByDesign(productSet: any[]): any[] {
    //   const groupedByDesign: any = {};
    //   productSet.forEach((product) => {
    //     const designKey = product.designNumber;
  
    //     if (!groupedByDesign[designKey]) {
    //       groupedByDesign[designKey] = {
    //         designNumber: product.designNumber,
    //         rows: [],
    //       };
    //     }
  
    //     let existingRow = groupedByDesign[designKey].rows.find(
    //       (row: any) => row.colourName === product.colourName
    //     );
  
    //     if (!existingRow) {
    //       existingRow = {
    //         colourName: product.colourName,
    //         colourImage: product.colourImage,
    //         colour: product.colour,
    //         quantities: {},
    //         totalPrice: 0,
    //       };
    //       groupedByDesign[designKey].rows.push(existingRow);
    //     }
  
    //     existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
    //     existingRow.totalPrice += product.quantity * product.price;
    //   });
  
    //   return Object.values(groupedByDesign);
    // }
  
    // extractSizesAndPrices(productSet: any[]): void {
    //   const uniqueSizes = new Set<string>();
    //   this.priceHeaders = {};
  
    //   productSet.forEach((product) => {
    //     if (product.size && product.price) {
    //       uniqueSizes.add(product.size);
    //       this.priceHeaders[product.size] = parseFloat(product.price);
    //     }
    //   });
  
    //   this.sizeHeaders = Array.from(uniqueSizes);
    // }
  
    calculateTotals(groupedProducts: any[]): any {
      let subTotal = 0;
      groupedProducts.forEach((group) => {
        group.rows.forEach((row: any) => {
          subTotal += row.totalPrice;
        });
      });
  
      const gst = (subTotal * 18) / 100;
      const grandTotal = subTotal + gst;
  
      return { subTotal, gst, grandTotal };
    }
  
    placeOrder(prod: any): void {
      if (!prod || !prod._id) {
        console.error('No distributor ID found:', prod);
        return;
      }
      this.authService.setOrderData({ distributorId: prod._id });
      this.router.navigate(['wholesaler/new/product/viewpo', prod._id]);
    }

    trackByManufacturer(index: number, item: any): string {
      return item.manufacturer._id || item.manufacturer.fullName;
    }
  }
  