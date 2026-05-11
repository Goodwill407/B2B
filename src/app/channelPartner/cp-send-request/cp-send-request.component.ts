import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-cp-send-request',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    NgClass,
    RouterModule,
    TooltipModule,
    BottomSideAdvertiseComponent,
  ],
  templateUrl: './cp-send-request.component.html',
  styleUrl: './cp-send-request.component.scss'
})
export class CpSendRequestComponent implements OnInit {
  allSentRequestList: any[] = [];
  totalResults: any;
  limit = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  user: any;

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;  // ✅ CP logged-in user
    this.getSentRequests();
  }

  getSentRequests(): void {
    // ✅ Uses requestByEmail = CP's email (outgoing requests FROM cp TO mfg)
    const endpoint = `request?requestByEmail=${this.user.email}&page=${this.page}&limit=${this.limit}&status=pending`;

    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        this.allSentRequestList = res.results;
        this.totalResults = res.totalResults;
      },
      error: (err: any) => {
        console.error('Error fetching sent requests:', err);
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getSentRequests();
  }

  // ✅ Cancel a pending outgoing request
  cancelRequest(data: any): void {
    const endpoint = `request/accept/${data.id}/${data.requestByEmail}/${data.email}`;
    const payload = { status: 'rejected' };

    this.authService.post(endpoint, payload).subscribe({
      next: () => {
        this.getSentRequests();
        this.communicationService.showNotification(
          'snackbar-success', 'Request Cancelled Successfully', 'bottom', 'center'
        );
      },
      error: (err: any) => {
        console.error('Error cancelling request:', err);
        this.communicationService.showNotification(
          'snackbar-error', 'Error cancelling request', 'bottom', 'center'
        );
      }
    });
  } 

   navigateToViewPage(data: any) {
  this.router.navigate(['/cp/view-mfg-details'], {
    queryParams: {
      id: data.id,
      email: data.email,
      RequestDetails: JSON.stringify(data)
    }
  });
}
}