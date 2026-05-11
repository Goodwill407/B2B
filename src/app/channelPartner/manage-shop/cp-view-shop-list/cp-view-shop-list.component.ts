import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cp-view-shop-list',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgIf,
    FormsModule,
    PaginatorModule,
    NgxSpinnerModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './cp-view-shop-list.component.html',
  styleUrl: './cp-view-shop-list.component.scss'
})
export class CpViewShopListComponent implements OnInit {

  shopList: any[] = [];
  userProfile: any;

  // Pagination
  currentPage   = 1;
  itemsPerPage  = 10;
  totalRecords  = 0;
  totalPages    = 0;

  // Filters
  searchText  = '';
filterStatus = '';

  Math = Math;

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    public  router: Router
  ) {}

  ngOnInit(): void {
    this.userProfile = this.authService.currentUserValue;
    this.loadShopList();
  }

  loadShopList() {
  this.spinner.show();

  const body = {
    search: this.searchText.trim(),
    filter: {
      ...(this.filterStatus ? { status: this.filterStatus } : {})
    },
    options: {
      page:    this.currentPage,
      limit:   this.itemsPerPage,
      sortBy:  'createdAt:desc'
    }
  };

  this.authService.post('channel-partner-customers/search', body).subscribe({
    next: (res: any) => {
      this.shopList     = res.data.results      || [];
      this.totalRecords = res.data.totalResults || 0;
      this.totalPages   = res.data.totalPages   || 0;
      this.spinner.hide();
    },
    error: () => {
      this.spinner.hide();
      this.communicationService.showNotification(
        'snackbar-danger', 'Failed to load shopkeepers.', 'bottom', 'center'
      );
    }
  });
}

onSearch() {
  this.currentPage = 1;
  this.loadShopList();
}

onClearFilters() {
  this.searchText   = '';
  this.filterStatus = '';
  this.currentPage  = 1;
  this.loadShopList();
}

  onPageChange(event: any) {
    this.currentPage  = event.page + 1;
    this.itemsPerPage = event.rows;
    this.loadShopList();
  }

  viewShop(id: string) {
    this.router.navigate(['/cp/cp-shop'], { queryParams: { id } });
  }

  editShop(id: string) {
  this.router.navigate(['/cp/cp-add-shop'], {
    queryParams: { id, mode: 'edit' }
  });
  }

  confirmToggleStatus(shop: any) {
  const isActive    = shop.status === 'active';
  const actionLabel = isActive ? 'Deactivate' : 'Activate';
  const actionColor = isActive ? '#d33' : '#28a745';
  const actionIcon  = isActive ? 'warning' : 'question';

  Swal.fire({
    title: `${actionLabel} Shopkeeper?`,
    text: `Are you sure you want to ${actionLabel.toLowerCase()} "${shop.fullName}"?`,
    icon: actionIcon,
    showCancelButton: true,
    confirmButtonColor: actionColor,
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${actionLabel}`,
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) this.toggleStatus(shop);
  });
}

toggleStatus(shop: any) {
  this.spinner.show();

  // PATCH with new status
  const newStatus = shop.status === 'active' ? 'blocked' : 'active';
  const formData  = new FormData();
  formData.append('status', newStatus);
  formData.append('isActive', newStatus === 'active' ? 'true' : 'false');

  this.authService.patchpimage(`channel-partner-customers/${shop.id}`, formData).subscribe({
    next: () => {
      this.spinner.hide();
      this.communicationService.showNotification(
        'snackbar-success',
        `Shopkeeper ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
        'bottom',
        'center'
      );
      this.loadShopList();
    },
    error: () => {
      this.spinner.hide();
      this.communicationService.showNotification(
        'snackbar-danger', 'Failed to update status.', 'bottom', 'center'
      );
    }
  });
}

  addShop() {
    this.router.navigate(['/cp/cp-add-shop']);
  }

  confirmDelete(id: string, name: string) {
    Swal.fire({
      title: 'Deactivate Shopkeeper?',
      text: `Are you sure you want to deactivate "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.deleteShop(id);
      }
    });
  }

  deleteShop(id: string) {
    this.spinner.show();
    this.authService.delete2(`channel-partner-customers/${id}`).subscribe({
      next: () => {
        this.spinner.hide();
        this.communicationService.showNotification(
          'snackbar-success', 'Shopkeeper deactivated successfully.', 'bottom', 'center'
        );
        this.loadShopList();
      },
      error: () => {
        this.spinner.hide();
        this.communicationService.showNotification(
          'snackbar-danger', 'Failed to deactivate shopkeeper.', 'bottom', 'center'
        );
      }
    });
  }
}