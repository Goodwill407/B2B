import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';

interface Item {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  subcategoryId: string;
  subcategoryName: string;
  subcategoryCode: string;
  itemName: string;
  code: string;
  vendorDetails: any;
  warehouseDetails: any;
  stockInHand: number;
  photo1: string;
  photo2: string;
  details: string;
  note: string;
  isActive: boolean;
}

@Component({
  selector: 'app-view-raw-item-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    TagModule,
    ImageModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './view-raw-item-list.component.html',
  styleUrl: './view-raw-item-list.component.scss',
})
export class ViewRawItemListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  loading = false;
  searchTerm = '';
  manufacturerEmail = '';

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.items = [];

    this.authService.get(`manufacture-item?manufacturerEmail=${this.manufacturerEmail}&limit=10000`).subscribe(
      (res: any) => {
        const data = res.data || res;
        this.items = data.results || [];
        this.filteredItems = [...this.items];
        this.loading = false;
      },
      () => {
        this.communicationService.customError1('Failed to load items');
        this.loading = false;
        this.items = [];
        this.filteredItems = [];
      }
    );
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.items];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredItems = this.items.filter(
        (item) =>
          item.itemName.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.categoryName.toLowerCase().includes(term) ||
          item.subcategoryName.toLowerCase().includes(term)
      );
    }
  }

  addItem(): void {
    this.router.navigate(['/mnf/add-raw-item']);
  }

  viewItem(itemId: string): void {
  this.router.navigate(['/mnf/view-item', itemId]);
}

  editItem(item: Item): void {
    this.router.navigate(['/mnf/update-raw-item', item.id]);
  }

  deleteItem(item: Item): void {
    this.confirmationService.confirm({
      message: `Delete item "${item.itemName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.authService.delete2(`manufacture-item/${item.id}`).subscribe(
          () => {
            this.communicationService.customSuccess('Item deleted successfully');
            this.loadItems();
          },
          () => {
            this.communicationService.customError1('Failed to delete item');
          }
        );
      },
    });
  }

  toggleItemStatus(item: Item): void {
    const url = `manufacture-item/${item.id}`;

    const updatedData = {
      isActive: !item.isActive,
      manufacturerEmail: this.manufacturerEmail,
    };

    this.authService.patchpimage(url, updatedData).subscribe(
      () => {
        this.communicationService.customSuccess(
          `Item ${updatedData.isActive ? 'activated' : 'deactivated'}`
        );
        this.loadItems();
      },
      () => {
        this.communicationService.customError1('Failed to update item status');
      }
    );
  }
}
