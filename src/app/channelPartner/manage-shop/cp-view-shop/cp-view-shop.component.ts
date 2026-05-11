import { CommonModule, DatePipe, Location, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cp-view-shop',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgIf,
    DatePipe,
    NgxSpinnerModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './cp-view-shop.component.html',
  styleUrl: './cp-view-shop.component.scss'
})
export class CpViewShopComponent implements OnInit {

  shopData: any = null;
  shopId: string = '';
  loading = false;

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];
  
  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.shopId = params['id'];
      if (this.shopId) this.loadShopDetails();
    });
  }

  loadShopDetails() {
    this.loading = true;
    this.spinner.show();
    this.authService.get(`channel-partner-customers/${this.shopId}`).subscribe({
      next: (res: any) => {
        this.shopData = res;
        this.loading = false;
        this.spinner.hide();
      },
      error: () => {
        this.loading = false;
        this.spinner.hide();
        this.communicationService.showNotification(
          'snackbar-danger', 'Failed to load shopkeeper details.', 'bottom', 'center'
        );
      }
    });
  }

  goBack() {
    this.location.back();
  }

  editShop() {
    this.router.navigate(['/cp/cp-add-shop'], { queryParams: { id: this.shopId, mode: 'edit' } });
  }

  confirmToggleStatus() {
  const isActive    = this.shopData?.status === 'active';
  const actionLabel = isActive ? 'Deactivate' : 'Activate';
  const actionColor = isActive ? '#d33' : '#28a745';
  const actionIcon  = isActive ? 'warning' : 'question';

  Swal.fire({
    title: `${actionLabel} Shopkeeper?`,
    text: `Are you sure you want to ${actionLabel.toLowerCase()} "${this.shopData?.fullName}"?`,
    icon: actionIcon,
    showCancelButton: true,
    confirmButtonColor: actionColor,
    cancelButtonColor: '#6c757d',
    confirmButtonText: `Yes, ${actionLabel}`,
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) this.toggleStatus();
  });
}

toggleStatus() {
  this.spinner.show();

  const newStatus = this.shopData?.status === 'active' ? 'blocked' : 'active';
  const formData  = new FormData();
  formData.append('status',   newStatus);
  formData.append('isActive', newStatus === 'active' ? 'true' : 'false');

  this.authService.patchpimage(`channel-partner-customers/${this.shopId}`, formData).subscribe({
    next: () => {
      this.spinner.hide();
      this.shopData.status   = newStatus;       // ✅ update UI instantly
      this.shopData.isActive = newStatus === 'active';
      this.communicationService.showNotification(
        'snackbar-success',
        `Shopkeeper ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
        'bottom',
        'center'
      );
    },
    error: () => {
      this.spinner.hide();
      this.communicationService.showNotification(
        'snackbar-danger', 'Failed to update status.', 'bottom', 'center'
      );
    }
  });
}
  openDocument() {
    if (this.shopData?.file) window.open(this.shopData.file, '_blank');
  }
}