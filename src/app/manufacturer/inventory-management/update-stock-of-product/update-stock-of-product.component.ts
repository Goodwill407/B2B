  import { DatePipe, Location, CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { ActivatedRoute, Router } from '@angular/router';
  import { AuthService, CommunicationService } from '@core';
  import { TableModule } from 'primeng/table';
  import { PanelModule } from 'primeng/panel';
  import { InputTextModule } from 'primeng/inputtext';
  import { ButtonModule } from 'primeng/button';

  @Component({
    selector: 'app-update-stock-of-product',
    standalone: true,
    imports: [
      CommonModule,
      DatePipe,
      FormsModule,
      TableModule,
      PanelModule,
      InputTextModule,
      ButtonModule
    ],
    templateUrl: './update-stock-of-product.component.html',
    styleUrl: './update-stock-of-product.component.scss'
  })
  export class UpdateStockOfProductComponent {
    product: any = null;
    inventoryStock: any[] = [];
    universalQuantity: number | null = null;
    universalAlert: number | null = null;
    user:any; 

    expandedDesignId: string | null = null;

    constructor(
      private location: Location,
      private route: ActivatedRoute,
      public authService: AuthService,
      private router: Router,
      private communicationService: CommunicationService
    ) {}

    ngOnInit() {
      this.user = this.authService.currentUserValue;
      
      this.route.queryParamMap.subscribe(params => {
    this.expandedDesignId = params.get('design');
    this.getProductDetails(); // fetch after reading param
  });
    }

    getProductDetails() {
      const inventoryUrl = `manufacture-inventory?userEmail=${this.user.email}`;
      // const inventoryUrl = `manufacture-inventory-logs?userEmail=${this.user.email}`;

      this.authService.get(inventoryUrl).subscribe((invRes: any) => {
        const results = invRes?.results || [];

        if (results.length === 0) {
          this.communicationService.customError('No inventory data found.');
          return;
        } else {
          this.inventoryStock = results.map((design: any) => ({
            ...design,
            entries: this.sortEntries(
              design.entries.map((entry: any) => ({
              ...entry,
              originalQuantity: entry.quantity || 0  
            }))
            ),
            totalQuantity: design.entries.reduce((sum: number, entry: any) => sum + (entry.quantity || 0), 0),
            expanded: this.expandedDesignId === design._id // <-- Auto-expand match
          }));
          setTimeout(() => {
          if (this.expandedDesignId) {
            const el = document.getElementById('panel-' + this.expandedDesignId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 100);
        }
      });
    }


  applyUniversalQuantity(design: any): void {
    const qtyToAdd = Number(this.universalQuantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      this.communicationService.customError('Please enter a valid quantity to add.');
    } else {
      design.entries.forEach((entry: any) => {
        entry.quantity = (Number(entry.quantity) || 0) + qtyToAdd;
      });
      // recompute this design’s total
      design.totalQuantity = this.getLiveTotalQuantity(design.entries);
      this.communicationService.customSuccess(`Added ${qtyToAdd} to ${design._id}`);
    }
    this.universalQuantity = null;
  }

    applyUniversalAlert(design: any): void {
    const alertValue = Number(this.universalAlert);
    if (isNaN(alertValue) || alertValue < 0) {
      this.communicationService.customError('Please enter a valid alert quantity to set.');
    } else {
      design.entries.forEach((entry: any) => {
        entry.minimumQuantityAlert = alertValue;
      });
      // (no need to touch totalQuantity)
      this.communicationService.customSuccess(`Set min‐alert ${alertValue} on ${design._id}`);
    }
    this.universalAlert = null;
    }

    get totalQuantity(): number {
      return this.inventoryStock.reduce((sum: number, design: any) => {
        const designTotal = design.entries.reduce((dSum: number, item: any) => {
          const qty = Number(item.quantity);
          return dSum + (isNaN(qty) ? 0 : qty);
        }, 0);
        return sum + designTotal;
      }, 0);
    }

    getTotalQuantity(entries: any[]): number {
    return entries.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }

  getLiveTotalQuantity(entries: any[]): number {
    return entries.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

    validateQuantity(product: any): void {
      if (product.quantity === null || product.quantity === '' || product.quantity < 0 || isNaN(product.quantity)) {
        product.quantity = 0;
      }
    }

    validateAlert(product: any): void {
      if (product.minimumQuantityAlert === null || product.minimumQuantityAlert === '' || product.minimumQuantityAlert < 0 || isNaN(product.minimumQuantityAlert)) {
        product.minimumQuantityAlert = 0;
      }
    }

    blockInvalidKeys(event: KeyboardEvent): void {
      if (["e", "+", "-", "."].includes(event.key)) {
        event.preventDefault();
      }
    }

    sortEntries(entries: any[]): any[] {
    return [...entries].sort((a, b) => {
      const rank = (item: any) => {
        if (item.quantity <= item.minimumQuantityAlert) return 0;         // 🔴 Critical Low
        if (item.quantity <= item.minimumQuantityAlert + 10) return 1;     // 🟡 Near Low
        return 2;                                                          // ✅ Normal
      };
      return rank(a) - rank(b);
    });
  }

  countCriticalLow(entries: any[]): number {
      return entries.filter(e => e.quantity <= e.minimumQuantityAlert).length;
    }

    countNearLow(entries: any[]): number {
      return entries.filter(e => e.quantity > e.minimumQuantityAlert && e.quantity <= e.minimumQuantityAlert + 10).length;
    }

    searchText: string = '';

  search(): void {
    const text = this.searchText?.trim().toLowerCase();
    if (!text) {
      this.getProductDetails(); // Reset list
      return;
    }

    this.inventoryStock = this.inventoryStock.filter((design: any) => {
      const inDesign = design._id?.toLowerCase().includes(text);
      // const inEntry = design.entries?.some((e: any) =>
      //   e.colourName?.toLowerCase().includes(text) ||
      //   e.colour?.toLowerCase().includes(text)
      // );
      // return inDesign || inEntry;
      return inDesign
    });
  }

  clearSearch(): void {
    this.searchText = '';
    this.getProductDetails();
  }

submitStockForDesign(design: any) {
  const validEntries = design.entries.filter((item: any) =>
    item.quantity !== null &&
    item.minimumQuantityAlert !== null &&
    item.quantity >= 0 &&
    item.minimumQuantityAlert >= 0
  );

  if (validEntries.length === 0) {
    this.communicationService.customError('Please enter valid stock quantities before submitting.');
    return;
  }

  this.authService.post('manufacture-inventory/bulk', validEntries).subscribe({
    next: () => {
      // ✅ Update UI
      const updatedEntries = this.sortEntries(
        design.entries.map((entry: any) => ({
          ...entry,
          quantity: Number(entry.quantity) || 0,
          minimumQuantityAlert: Number(entry.minimumQuantityAlert) || 0
        }))
      );
      const updatedTotal = updatedEntries.reduce((sum: number, e: any) => sum + e.quantity, 0);

      const index = this.inventoryStock.findIndex(d => d._id === design._id);
      if (index !== -1) {
        this.inventoryStock[index] = {
          ...design,
          entries: updatedEntries,
          totalQuantity: updatedTotal
        };
      }

      // ✅ Prepare log payload
      const logPayload = this.createLogPayloadFromDesign(design);

      if (logPayload.length === 0) {
        this.communicationService.showNotification(
          'snackbar-success',
          'Stock Updated (no quantity changes to log)',
          'bottom',
          'center'
        );
        return;
      }

      // ✅ Log only if changes occurred
      this.authService.post('manufacture-inventory-logs', logPayload).subscribe({
        next: () => {
          this.communicationService.showNotification(
            'snackbar-success',
            'Stock and Logs Updated Successfully for ' + design._id,
            'bottom',
            'center'
          );
        },
        error: (err) => {
          console.error('Log failed', err);
          this.communicationService.customError('Stock updated, but log failed.');
        }
      });
    },
    error: () => {
      this.communicationService.customError('Failed to update stock for ' + design._id);
    }
  });
}

createLogPayloadFromDesign(design: any): any[] {
  const currentUser = this.authService?.currentUserValue?.email || 'admin@example.com';
  const now = new Date().toISOString();

  return design.entries
    .filter((entry: any) => {
      const newQty = Number(entry.quantity) || 0;
      const oldQty = Number(entry.originalQuantity) || 0;
      return newQty !== oldQty; // Only log if there was a change
    })
    .map((entry: any) => {
      const newQty = Number(entry.quantity) || 0;
      const oldQty = Number(entry.originalQuantity) || 0;

      const delta = newQty - oldQty;
      const status = delta > 0 ? 'stock_added' : 'stock_removed';

      return {
        userEmail: entry.userEmail,
        productId: entry.productId,
        designNumber: entry.designNumber,
        colour: entry.colour,
        brandName: entry.brandName,
        colourName: entry.colourName,
        brandSize: entry.brandSize,
        standardSize: entry.standardSize,
        recordsArray: [
          {
            updatedQuantity: Math.abs(delta),
            previousRemainingQuantity: oldQty,
            lastUpdatedBy: currentUser,
            lastUpdatedAt: now,
            status: status
          }
        ]
      };
    });
}

    navigateOnProduct() {
      this.communicationService.showNotification(
        'snackbar-success',
        'Saved Successfully...!!!',
        'bottom',
        'center'
      );
      setTimeout(() => {
        this.router.navigate(['mnf/new/manage-product2']);
      }, 1500);
    }
  }
