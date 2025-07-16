import { Component } from '@angular/core';
import { DatePipe, Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ret-update-stock-of-product',
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
  templateUrl: './ret-update-stock-of-product.component.html',
  styleUrl: './ret-update-stock-of-product.component.scss'
})
export class RetUpdateStockOfProductComponent {
product: any = null;
  inventoryStock: any[] = [];
  universalQuantity: number | null = null;
  universalAlert: number | null = null;
  user: any;
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
    this.getProductDetails();
    console.log("c wokring")
  }

  getProductDetails() {
     const inventoryUrl = `manufacture-inventory`
    // const inventoryUrl = `wholesale-inventory?userEmail=${this.user.email}`;
    this.authService.get(inventoryUrl).subscribe((invRes: any) => {
      const results = invRes?.results || [];
      if (results.length === 0) {
        this.communicationService.customError('No inventory data found.');
        return;
      } else {
        this.inventoryStock = results.map((design: any) => ({
          ...design,
          entries: this.sortEntries(design.entries),
          totalQuantity: design.entries.reduce((sum: number, entry: any) => sum + (entry.quantity || 0), 0)
        }));
      }
    });
  }

  applyUniversalQuantity(): void {
    const qtyToAdd = Number(this.universalQuantity);
    if (!isNaN(qtyToAdd) && qtyToAdd > 0) {
      this.inventoryStock.forEach((design: any) => {
        design.entries.forEach((entry: any) => {
          entry.quantity = (Number(entry.quantity) || 0) + qtyToAdd;
        });
      });
      this.communicationService.customSuccess(`Added ${qtyToAdd} to all item quantities.`);
    } else {
      this.communicationService.customError('Please enter a valid quantity to add.');
    }
    this.universalQuantity = null;
  }

  applyUniversalAlert(): void {
    const alertValue = Number(this.universalAlert);
    if (!isNaN(alertValue) && alertValue >= 0) {
      this.inventoryStock.forEach((design: any) => {
        design.entries.forEach((entry: any) => {
          entry.minimumQuantityAlert = alertValue;
        });
      });
      this.communicationService.customSuccess(`Minimum alert quantity set to ${alertValue} for all items.`);
    } else {
      this.communicationService.customError('Please enter a valid alert quantity to set.');
    }
    this.universalAlert = null;
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
    return entries.filter(e => e.quantity > e.minimumQuantityAlert && e.quantity <= e.minimumQuantityAlert + 10).length;
  }

  search(): void {
    const text = this.searchText?.trim().toLowerCase();
    if (!text) {
      this.getProductDetails();
      return;
    }
    this.inventoryStock = this.inventoryStock.filter((design: any) => {
      return design._id?.toLowerCase().includes(text);
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

    this.authService.post('wholesale-inventory/bulk', validEntries).subscribe({
      next: () => {
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

        this.communicationService.showNotification(
          'snackbar-success',
          'Stock Updated Successfully for ' + design._id,
          'bottom',
          'center'
        );
      },
      error: () => {
        this.communicationService.customError('Failed to update stock for ' + design._id);
      }
    });
  }
}

