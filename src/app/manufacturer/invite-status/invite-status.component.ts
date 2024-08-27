import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG

@Component({
  selector: 'app-invite-status',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf
  ],
  templateUrl: './invite-status.component.html',
  styleUrls: ['./invite-status.component.scss'] // Use 'styleUrls' instead of 'styleUrl'
})
export class InviteStatusComponent {
  user: any;
  totalResults: any;
  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;

  distributors: any[] = [];
  selectedDistributors: any[] = [];

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
