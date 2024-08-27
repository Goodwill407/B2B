import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailer-invite-status',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retailer-invite-status.component.html',
  styleUrl: './retailer-invite-status.component.scss'
})
export class RetailerInviteStatusComponent {
  user: any;
  totalResults: any;
  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;

  distributors: any[] = [];
  selectedDistributors: any[] = [];

  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';


  constructor(private authService: AuthService, private communicationService: CommunicationService) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getPendingInvites();
  }

  getPendingInvites() {
    this.authService.get(`invitations?page=${this.page}&limit=${this.limit}&status=pending&invitedBy=${this.user.email}`).subscribe((res: any) => {
      this.distributors = res.results;
      this.totalResults = res.totalResults;
      // Initialize selected distributors list based on current data
      this.updateSelectedDistributors();
    });
  }

  reInvite(data: any) {
    this.authService.get(`invitations/re-invitation/${data.email}`).subscribe((res: any) => {
      this.communicationService.showNotification('snackbar-success', 'Re-invitation Sent Successfully', 'bottom', 'center');
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getPendingInvites();
  }

  reInviteToAll() {
    // Extract emails of selected distributors into an array
    const selectedEmails = this.distributors
      .filter((d: any) => d.selected)
      .map((d: any) => d.email);

    if (selectedEmails.length > 0) {
      // Send the array of selected emails to the API
      this.authService.post('invitations/bulk/re-invitation/array', { emails: selectedEmails }).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Re-invitation Sent Successfully', 'bottom', 'center');
        // Clear selection after sending
        this.distributors.forEach((d: any) => d.selected = false);
        this.updateSelectedDistributors(); // Update the list after clearing
      });
    } else {
      this.communicationService.showNotification('snackbar-warning', 'No distributors selected', 'bottom', 'center');
    }
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.distributors.forEach((d: any) => d.selected = isChecked);
    this.updateSelectedDistributors();
  }

  updateSelectedDistributors() {
    this.selectedDistributors = this.distributors.filter(d => d.selected);
  }

}

