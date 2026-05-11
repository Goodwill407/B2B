import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-list-channel-partner',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgClass,
    TableModule,
    PaginatorModule,
    TooltipModule
  ],
  templateUrl: './list-channel-partner.component.html',
  styleUrl: './list-channel-partner.component.scss'
})
export class ListChannelPartnerComponent {

  user: any;
  channelPartners: any[] = [];
  totalResults: number = 0;
  page: number = 1;
  limit: number = 10;
  first: number = 0;
  rows: number = 10;
  searchPerformed: boolean = false;
  isLoading: boolean = false;
  currentSearch: string = ''; 

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getChannelPartners();
  }

  getChannelPartners(searchKey: string = '') {
  this.isLoading = true;

  const body: any = {
    manufacturerEmail: this.user.email,
    page: this.page,
    limit: this.limit,
  };

  // Only add search if user has typed something
  if (searchKey && searchKey.trim() !== '') {
    body.search = searchKey.trim();
  }

  this.authService.post(`channel-partner/by-manufacturer`, body).subscribe({
    next: (res: any) => {
      this.channelPartners = res.results;
      this.totalResults = res.totalResults;
      this.isLoading = false;
    },
    error: (err: any) => {
      this.isLoading = false;
      this.communicationService.showNotification(
        'snackbar-danger',
        'Failed to load channel partners',
        'bottom',
        'center'
      );
    }
  });
}
  
onSearchChange(event: any) {
  this.searchPerformed = true;
  this.currentSearch = event.target.value;  // ← save it
  this.page = 1;
  this.first = 0;
  this.getChannelPartners(this.currentSearch);
}

onPageChange(event: any) {
  this.page = event.page + 1;
  this.limit = event.rows;
  this.getChannelPartners(this.currentSearch);  // ← use saved search
}

  viewChannelPartner(cp: any) {
    this.router.navigate(['/mnf/view-ch-partner', cp.email]);
  }

  addChannelPartner() {
    this.router.navigate(['/mnf/link-ch-partner']);
  }

  deleteChannelPartner(cp: any) {
    if (!confirm(`Are you sure you want to delete "${cp.fullName}"?`)) return;

    this.authService.delete2(`channel-partner/${cp.email}`).subscribe({
      next: () => {
        this.communicationService.showNotification('snackbar-success', 'Channel Partner deleted successfully', 'bottom', 'center');
        this.getChannelPartners();
      },
      error: (err: any) => {
        this.communicationService.showNotification('snackbar-danger', err?.error?.message || 'Failed to delete', 'bottom', 'center');
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'pending': return 'badge-pending';
      case 'blocked': return 'badge-blocked';
      default: return 'badge-pending';
    }
  }

  getMyCommission(cp: any): any {
  if (!cp.commissionGiven || !cp.commissionGiven.length) return null;
  return cp.commissionGiven.find(
    (c: any) => c.commissionGivenBy === this.user.email
  ) || null;
}

  unlinkChannelPartner(cp: any) {
  if (!confirm(`Are you sure you want to unlink "${cp.fullName}"?`)) return;

  this.authService.post('channel-partner/unlink', { cpEmail: cp.email }).subscribe({
    next: () => {
      this.communicationService.showNotification(
        'snackbar-success',
        'Channel Partner unlinked successfully',
        'bottom',
        'center'
      );
      this.getChannelPartners(this.currentSearch);
    },
    error: (err: any) => {
      this.communicationService.showNotification(
        'snackbar-danger',
        err?.error?.message || 'Failed to unlink',
        'bottom',
        'center'
      );
    }
  });
}
}