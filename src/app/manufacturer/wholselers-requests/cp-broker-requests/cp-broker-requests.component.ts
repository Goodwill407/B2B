import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-cp-broker-requests',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    NgClass,
    RouterModule,
    TooltipModule
  ],
  templateUrl: './cp-broker-requests.component.html',
  styleUrl: './cp-broker-requests.component.scss'
})
export class CpBrokerRequestsComponent {
  allRequestedList: any;
  totalResults: any;
  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllBrokerRequests();
  }

  getAllBrokerRequests(): void {
    const endpoint = `request?email=${this.user.email}&requestByRole=channelPartner&page=${this.page}&limit=${this.limit}`;

    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        this.allRequestedList = res.results.filter((item: any) => item.status === 'pending');
        this.totalResults = res.totalResults;
      },
      error: (err: any) => {
        console.error('Error fetching data:', err);
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllBrokerRequests();
  }

  requestAcceptOrRejectChange(data: any, status: string): void {
    const endpoint = `request/accept/${data.id}/${data.requestByEmail}/${data.email}`;
    const payload = { status };

    this.authService.post(endpoint, payload).subscribe({
      next: (res: any) => {
        this.getAllBrokerRequests();
        const message = status === 'accepted'
          ? 'Request Accepted successfully'
          : 'Request Rejected successfully';
        this.communicationService.showNotification('snackbar-success', message, 'bottom', 'center');
      },
      error: (err: any) => {
        console.error('Error processing request:', err);
        this.communicationService.showNotification('snackbar-error', 'An error occurred while processing the request', 'bottom', 'center');
      }
    });
  }

  viewChannelPartner(cp: any) {
    this.router.navigate(['/mnf/view-ch-partner', cp.requestByEmail], {
      // queryParams: { from: 'link' }
    });
  }
}