import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Vendor {
  id: string;
  vendorName: string;
  companyName: string;
  vendorEmail: string;
  contactNumber: string;
  altContactNumber: string;
  gstNumber: string;
  panNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  materialCategories: string[];
  paymentTerms: string;
  isActive: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-vendor-list',
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
  templateUrl: './vendor-list.component.html',
  styleUrl: './vendor-list.component.scss'
})
export class VendorListComponent implements OnInit {
  vendors: Vendor[] = [];
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
    this.loadVendors();
  }

  loadVendors(): void {
    this.loading = true;
    const url = `manufacturer-vendors?manufacturerEmail=${this.manufacturerEmail}`;
    
    this.authService.get(url).subscribe(
      (res: any) => {
        this.vendors = res.results || res || [];
        this.loading = false;
      },
      (err) => {
        console.error('Error loading vendors:', err);
        this.communicationService.customError1('Failed to load vendors');
        this.loading = false;
      }
    );
  }

  addVendor(): void {
    this.router.navigate(['/mnf/add-vendor']);
  }

  editVendor(vendor: Vendor): void {
    this.router.navigate(['/mnf/update-vendor', vendor.id]);
  }

  deleteVendor(vendor: Vendor): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${vendor.vendorName}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const url = `manufacturer-vendors/perment/${vendor.id}`;
        this.authService.delete2(url).subscribe(
          () => {
            this.communicationService.customSuccess('Vendor deleted successfully');
            this.loadVendors();
          },
          (err) => {
            console.error('Error deleting vendor:', err);
            this.communicationService.customError1('Failed to delete vendor');
          }
        );
      }
    });
  }

  toggleVendorStatus(vendor: Vendor): void {
    const url = `manufacturer-vendors/${vendor.id}`;
    const updatedData = { isActive: !vendor.isActive };

    this.authService.patchpimage(url, updatedData).subscribe(
      () => {
        this.communicationService.customSuccess(
          `Vendor ${updatedData.isActive ? 'activated' : 'deactivated'} successfully`
        );
        this.loadVendors();
      },
      (err) => {
        console.error('Error updating vendor status:', err);
        this.communicationService.customError1('Failed to update vendor status');
      }
    );
  }

  viewVendor(vendor: Vendor): void {
  this.router.navigate(['/mnf/view-vendor', vendor.id]);
 }
}
