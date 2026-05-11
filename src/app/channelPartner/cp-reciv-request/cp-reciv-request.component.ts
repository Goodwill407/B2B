import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-cp-reciv-request',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    NgClass,
    RouterModule,
    TooltipModule,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
  ],
  templateUrl: './cp-reciv-request.component.html',
  styleUrl: './cp-reciv-request.component.scss'
})
export class CpRecivRequestComponent implements OnInit {
  allRequestedList: any[] = [];
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
    this.getAllRequests();
  }

  getAllRequests(): void {
    // ✅ Uses CP's email (current login user) instead of manufacturer email
    const endpoint = `request?email=${this.user.email}&page=${this.page}&limit=${this.limit}`;

    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        this.allRequestedList = res.results.filter(
          (item: any) => item.status === 'pending'
        );
        this.totalResults = res.totalResults;
      },
      error: (err: any) => {
        console.error('Error fetching CP requests:', err);
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllRequests();
  }

  requestAcceptOrReject(data: any, status: string): void {
    const endpoint = `request/accept/${data.id}/${data.requestByEmail}/${data.email}`;
    const payload = { status: status };

    this.authService.post(endpoint, payload).subscribe({
      next: (res: any) => {
        this.getAllRequests();
        const message = status === 'accepted'
          ? 'Request Accepted Successfully'
          : 'Request Rejected Successfully';
        this.communicationService.showNotification(
          'snackbar-success', message, 'bottom', 'center'
        );
      },
      error: (err: any) => {
        console.error('Error processing request:', err);
        this.communicationService.showNotification(
          'snackbar-error',
          'An error occurred while processing the request',
          'bottom', 'center'
        );
      }
    });
  }

  navigateToViewPage(data: any) {
  this.router.navigate(['/cp/view-mfg-details'], {
    queryParams: {
      id: data.id,
      email: data.requestByEmail,
      isForView: true,  
      RequestDetails: JSON.stringify(data)
    }
  });
}
}