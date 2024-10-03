import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-rejected-retailers-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    NgClass,
    RouterModule,
    TooltipModule ,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
  ],
  templateUrl: './rejected-retailers-list.component.html',
  styleUrl: './rejected-retailers-list.component.scss'
})
export class RejectedRetailersListComponent {
  allRequestedList: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  user: any;

  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';
  
  constructor(private authService: AuthService, private router: Router,private communicationService:CommunicationService) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllRejectedRetailersList();
  }

  getAllRejectedRetailersList(): void {
    const status='rejected'
    // Construct the API endpoint URL dynamically
    const endpoint = `request/filterdata/status?status=${status}&email=${this.user.email}&page=${this.page}&limit=${this.limit}&status=rejected`;
    
    // Call the API using the authService
    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        // Filter the results where status is "pending"
        this.allRequestedList = res.results;
        
        // Store the total count of documents
        this.totalResults = res.totalResults;
      },
      error: (err: any) => {
        // Handle errors here
        console.error('Error fetching data:', err);
      }
    });
  }
  

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllRejectedRetailersList();
  }

  requestAcceptOrRejectChange(data: any, status: string): void {
    // Construct the API endpoint URL dynamically
    const endpoint = `request/accept/${data.id}/${data.requestByEmail}/${data.email}`;
  
    // Create the request payload with the updated status
    const payload = {
      status: status
    };
  
    // Send a POST request to the backend using authService
    this.authService.post(endpoint, payload).subscribe({
      next: (res: any) => {
        // Reload the manufacturer list after the request is processed
        this.getAllRejectedRetailersList();
        
        // Show a notification based on the status
        const message = status === 'accepted' ? 'Request Accepted successfully' : 'Request Rejected successfully';
        this.communicationService.showNotification('snackbar-success', message, 'bottom', 'center');
      },
      error: (err: any) => {
        // Handle errors gracefully
        console.error('Error processing request:', err);
        this.communicationService.showNotification('snackbar-error', 'An error occurred while processing the request', 'bottom', 'center');
      }
    });
  }
}
