import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Rack {
  rackName: string;
  columnsCount: number;
  notes: string;
  columnNaming: string;
}

interface Warehouse {
  id: string;
  warehouseName: string;
  code: string;
  contactPersonName: string;
  contactNumber: string;
  altContactNumber: string;
  email: string;
  gstNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  isPrimary: boolean;
  storageCapacity: string;
  notes: string;
  racks: Rack[];
  totalRacks: number;
  totalColumns: number;
  isActive: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './warehouse-list.component.html',
  styleUrl: './warehouse-list.component.scss'
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  loading: boolean = false;
  manufacturerEmail: string = '';

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.manufacturerEmail = currentUser?.email || '';
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    const url = `manufacture-warehouse?manufacturerEmail=${this.manufacturerEmail}`;
    
    this.authService.get(url).subscribe(
      (res: any) => {
        this.warehouses = res.results || res || [];
        this.loading = false;
      },
      (err) => {
        console.error('Error loading warehouses:', err);
        this.communicationService.customError1('Failed to load warehouses');
        this.loading = false;
      }
    );
  }

  addWarehouse(): void {
    this.router.navigate(['/mnf/add-warehouse']);
  }

  editWarehouse(warehouse: Warehouse): void {
    this.router.navigate(['/mnf/update-warehouse', warehouse.id]);
  }

  deleteWarehouse(warehouse: Warehouse): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${warehouse.warehouseName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const url = `manufacture-warehouse/perment/${warehouse.id}`;
        this.authService.delete2(url).subscribe(
          () => {
            this.communicationService.customSuccess('Warehouse deleted successfully');
            this.loadWarehouses();
          },
          (err) => {
            console.error('Error deleting warehouse:', err);
            this.communicationService.customError1('Failed to delete warehouse');
          }
        );
      }
    });
  }

  toggleWarehouseStatus(warehouse: Warehouse): void {
    const url = `manufacture-warehouse/${warehouse.id}`;
    const updatedData = { isActive: !warehouse.isActive };

    this.authService.patchpimage(url, updatedData).subscribe(
      () => {
        this.communicationService.customSuccess(
          `Warehouse ${updatedData.isActive ? 'activated' : 'deactivated'} successfully`
        );
        this.loadWarehouses();
      },
      (err) => {
        console.error('Error updating warehouse status:', err);
        this.communicationService.customError1('Failed to update warehouse status');
      }
    );
  }

  viewWarehouse(warehouse: Warehouse): void {
    this.router.navigate(['/mnf/view-warehouse', warehouse.id]);
  }

  getPrimaryBadge(warehouse: Warehouse): string {
    return warehouse.isPrimary ? 'Primary' : 'Secondary';
  }
}
