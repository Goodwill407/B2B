import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-wholselers-requests',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    NgClass, RouterModule,    
  ],
  templateUrl: './wholselers-requests.component.html',
  styleUrl: './wholselers-requests.component.scss'
})
export class WholselersRequestsComponent {
  allRequestedList: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  user: any;

  
  constructor(private authService: AuthService, private router: Router,private communicationService:CommunicationService) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllMnf();
  }

  getAllMnf(): void {
    // Construct the API endpoint URL dynamically
    const endpoint = `request?email=${this.user.email}&page=${this.page}&limit=${this.limit}`;
    
    // Call the API using the authService
    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        // Handle the successful response
        this.allRequestedList = res.results           // Assign the data to the local variable
        this.totalResults = res.totalResults; // Store the total count of documents
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
    this.getAllMnf();
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
        this.getAllMnf();
        
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