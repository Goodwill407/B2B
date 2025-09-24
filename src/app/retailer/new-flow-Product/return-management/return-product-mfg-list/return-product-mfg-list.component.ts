import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-return-product-mfg-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './return-product-mfg-list.component.html',
  styleUrl: './return-product-mfg-list.component.scss'
})
export class ReturnProductMfgListComponent implements OnInit {

  returnOrderList: any[] = []; // Array to hold the list of return orders
  first: number = 0;  // For pagination
  rows: number = 10;  // For pagination
  totalResults: number = 0;  // Total number of results for pagination
  loading: boolean = false; // Loading state
  currentPage: number = 1; // Current page number

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.getReturnOrders();
  }

  getReturnOrders() {
    this.loading = true;

    // API endpoint with retailer email parameter for return orders
    const retailerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `return-r2m?retailerEmail=${retailerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.returnOrderList = res.results || [];  // Based on actual response structure
        this.totalResults = res.totalResults || 0; // Based on actual response structure
        this.loading = false;
        console.log('Return Order List:', this.returnOrderList);
        console.log('Total Results:', this.totalResults);
      },
      (error) => {
        console.error('Error fetching return orders:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load return orders');
      }
    );
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getReturnOrders();
  }

  // Helper method to get return reasons summary
  getReturnReasons(deliveryItems: any[]): string {
    if (!deliveryItems || deliveryItems.length === 0) return 'N/A';
    
    const reasons = deliveryItems.map(item => item.returnReason).filter(reason => reason);
    const uniqueReasons = [...new Set(reasons)];
    
    return uniqueReasons.length > 0 ? uniqueReasons.join(', ') : 'N/A';
  }

  // Helper method to format status
  getStatusDisplay(status: string): string {
    switch(status) {
      case 'return_requested':
        return 'Return Requested';
      case 'return_approved':
        return 'Return Approved';
      case 'return_rejected':
        return 'Return Rejected';
      case 'return_completed':
        return 'Return Completed';
      default:
        return status || 'N/A';
    }
  }

  // Helper method to get status class for styling
  getStatusClass(status: string): string {
    switch(status) {
      case 'return_requested':
        return 'badge bg-warning text-dark';
      case 'return_approved':
        return 'badge bg-success';
      case 'return_rejected':
        return 'badge bg-danger';
      case 'return_completed':
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  }
}
