import { DatePipe, Location, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import Swal from 'sweetalert2';

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
    ButtonModule,
    PaginatorModule
  ],
  templateUrl: './update-stock-of-product.component.html',
  styleUrls: ['./update-stock-of-product.component.scss']
})
export class UpdateStockOfProductComponent {
  product: any = null;
  inventoryStock: any[] = [];
  universalQuantity: number | null = null;
  universalAlert: number | null = null;
  user: any;
  expandedDesignId: string | null = null;

  // pagination & unified search
  page: number = 1;
  rows: number = 10;
  totalRecords: number = 0;
  searchText: string = '';

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
      this.getProductDetails();
    });
  }

  getProductDetails() {
    let params = `?userEmail=${this.user.email}&limit=${this.rows}&page=${this.page}`;
    if (this.searchText?.trim()) {
      params += `&search=${encodeURIComponent(this.searchText.trim())}`;
    }
    const inventoryUrl = `manufacture-inventory${params}`;

    this.authService.get(inventoryUrl).subscribe((invRes: any) => {
      const results = invRes?.results || [];
      this.inventoryStock = results.map((design: any) => ({
        ...design,
        entries: this.sortEntries(
          design.entries.map((entry: any) => ({
            ...entry,
            originalQuantity: entry.quantity || 0
          }))
        ),
        totalQuantity: design.entries.reduce((sum: number, e: any) => sum + (e.quantity || 0), 0),
        expanded: this.expandedDesignId === design._id
      }));

      this.totalRecords = invRes?.totalResults ?? this.inventoryStock.length;

      setTimeout(() => {
        if (this.expandedDesignId) {
          const el = document.getElementById('panel-' + this.expandedDesignId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }

  onPageChange(event: any) {
    this.rows = event.rows;
    this.page = event.page + 1;
    this.getProductDetails();
  }

  search(): void {
    this.page = 1;
    this.getProductDetails();
  }

  clearSearch(): void {
    this.searchText = '';
    this.page = 1;
    this.getProductDetails();
  }

  applyUniversalQuantity(design: any): void {
    const qtyToAdd = Number(this.universalQuantity);
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      this.communicationService.customError('Please enter a valid quantity to add.');
    } else {
      design.entries.forEach((entry: any) => {
        entry.quantity = (Number(entry.quantity) || 0) + qtyToAdd;
      });
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
    if (product.quantity == null || product.quantity < 0 || isNaN(product.quantity)) {
      product.quantity = 0;
    }
  }

  validateAlert(product: any): void {
    if (
      product.minimumQuantityAlert == null ||
      product.minimumQuantityAlert < 0 ||
      isNaN(product.minimumQuantityAlert)
    ) {
      product.minimumQuantityAlert = 0;
    }
  }

  blockInvalidKeys(event: KeyboardEvent): void {
    if (['e', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }

  sortEntries(entries: any[]): any[] {
    return [...entries].sort((a, b) => {
      const rank = (item: any) => {
        if (item.quantity <= item.minimumQuantityAlert) return 0;
        if (item.quantity <= item.minimumQuantityAlert + 10) return 1;
        return 2;
      };
      return rank(a) - rank(b);
    });
  }

  countCriticalLow(entries: any[]): number {
    return entries.filter(e => e.quantity <= e.minimumQuantityAlert).length;
  }

  countNearLow(entries: any[]): number {
    return entries.filter(
      e =>
        e.quantity > e.minimumQuantityAlert &&
        e.quantity <= e.minimumQuantityAlert + 10
    ).length;
  }

  submitStockForDesign(design: any) {
  const validEntries = design.entries.filter((item: any) =>
    item.quantity != null &&
    item.minimumQuantityAlert != null &&
    item.quantity >= 0 &&
    item.minimumQuantityAlert >= 0
  );

  if (validEntries.length === 0) {
    this.communicationService.customError(
      'Please enter valid stock quantities before submitting.'
    );
    return;
  }

  const updatedEntries = design.entries.map((entry: any) => ({
    ...entry,
    quantity: Number(entry.quantity) || 0,
    minimumQuantityAlert: Number(entry.minimumQuantityAlert) || 0
  }));

  const stockRemovedEntries = updatedEntries.filter((entry: any) =>
    Number(entry.quantity) < Number(entry.originalQuantity)
  );

  // If stock is removed, prompt for confirmation & reason
  if (stockRemovedEntries.length > 0) {
    const htmlInputs = stockRemovedEntries.map((entry:any, idx:any) => `
      <tr>
        <td>${entry.brandSize}</td>
        <td>${entry.colourName}</td>
        <td>
          <input type="text" id="reason-${idx}" class="swal2-input" placeholder="Enter reason"/>
        </td>
      </tr>
    `).join('');

    Swal.fire({
      title: 'Stock Removal Confirmation',
      html: `
        <p>Are you sure you want to remove stock from <b>${design._id}</b>?</p>
        <table class="table table-bordered">
          <thead><tr><th>Size</th><th>Color</th><th>Reason</th></tr></thead>
          <tbody>${htmlInputs}</tbody>
        </table>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm & Update',
      preConfirm: () => {
        const reasons = stockRemovedEntries.map((_:any, idx:any) => {
          const input = (document.getElementById(`reason-${idx}`) as HTMLInputElement)?.value;
          return input?.trim();
        });

        if (reasons.some((r:any) => !r)) {
          Swal.showValidationMessage('All reasons are required for removed stock');
          return;
        }

        return reasons;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const reasons = result.value;
        this.proceedWithStockUpdate(design, updatedEntries, reasons);
      }
    });
  } else {
    // No stock removed, proceed directly
    this.proceedWithStockUpdate(design, updatedEntries, []);
  }
}

  createLogPayloadWithReasons(design: any, reasons: string[] = []): any[] {
  const currentUser = this.authService?.currentUserValue?.email || 'admin@example.com';
  const now = new Date().toISOString();

  let reasonIndex = 0;

  return design.entries
    .filter((entry: any) => {
      const newQty = Number(entry.quantity) || 0;
      const oldQty = Number(entry.originalQuantity) || 0;
      return newQty !== oldQty;
    })
    .map((entry: any) => {
      const newQty = Number(entry.quantity);
      const oldQty = Number(entry.originalQuantity);
      const delta = newQty - oldQty;
      const status = delta > 0 ? 'stock_added' : 'stock_removed';

      const record: any = {
        updatedQuantity: Math.abs(delta),
        previousRemainingQuantity: oldQty,
        lastUpdatedBy: currentUser,
        lastUpdatedAt: now,
        status
      };

      // Add reason if stock removed
      if (status === 'stock_removed') {
        record.reason = reasons[reasonIndex++] || '';
      }

      return {
        userEmail: currentUser,
        productId: entry.productId,
        designNumber: entry.designNumber,
        colour: entry.colour,
        brandName: entry.brandName,
        colourName: entry.colourName,
        brandSize: entry.brandSize,
        standardSize: entry.standardSize,
        recordsArray: [record]
      };
    });
}

proceedWithStockUpdate(design: any, updatedEntries: any[], removalReasons: string[]) {
  this.authService.post('manufacture-inventory/bulk', updatedEntries).subscribe({
    next: () => {
      const sortedEntries = this.sortEntries(updatedEntries);
      const updatedTotal = sortedEntries.reduce((s: number, e: any) => s + e.quantity, 0);

      const idx = this.inventoryStock.findIndex(d => d._id === design._id);
      if (idx !== -1) {
        this.inventoryStock[idx] = {
          ...design,
          entries: sortedEntries,
          totalQuantity: updatedTotal
        };
      }

      const logPayload = this.createLogPayloadWithReasons(design, removalReasons);

      if (!logPayload.length) {
        this.communicationService.showNotification(
          'snackbar-success',
          'Stock Updated (no quantity changes to log)',
          'bottom',
          'center'
        );
        return;
      }

      this.authService.post('manufacture-inventory-logs', logPayload).subscribe({
        next: () => {
          this.communicationService.showNotification(
            'snackbar-success',
            'Stock and Logs Updated Successfully for ' + design._id,
            'bottom',
            'center'
          );
        },
        error: err => {
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
