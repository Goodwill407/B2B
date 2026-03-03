import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-ret-wh-return-order-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './ret-wh-return-order-list.component.html',
  styleUrl: './ret-wh-return-order-list.component.scss'
})
export class RetWhReturnOrderListComponent implements OnInit {

  returnOrderList: any[] = [];
  first: number = 0;
  rows: number = 10;
  totalResults: number = 0;
  loading: boolean = false;
  currentPage: number = 1;

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

    const whlEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `return-r2w?wholesalerEmail=${whlEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.returnOrderList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('WHL Return Order List:', this.returnOrderList);
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

  getReturnReasons(deliveryItems: any[]): string {
    if (!deliveryItems || deliveryItems.length === 0) return 'N/A';
    const reasons = deliveryItems.map(item => item.returnReason).filter(reason => reason);
    const uniqueReasons = [...new Set(reasons)];
    return uniqueReasons.length > 0 ? uniqueReasons.join(', ') : 'N/A';
  }

  // All 8 ReturnR2W schema statuses
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'return_requested':
        return 'Return Requested';
      case 'return_checked':
        return 'Return Checked';
      case 'return_approved':
        return 'Return Approved';
      case 'return_rejected':
        return 'Return Rejected';
      case 'return_in_transit':
        return 'Return In Transit';
      case 'return_received':
        return 'Return Received';
      case 'credit_note_created':
        return 'Credit Note Created';
      case 'resolved':
        return 'Resolved';
      default:
        return status || 'N/A';
    }
  }

  // All 8 ReturnR2W schema statuses
  getStatusClass(status: string): string {
    switch (status) {
      case 'return_requested':
        return 'badge bg-warning text-dark';
      case 'return_checked':
        return 'badge bg-info text-dark';
      case 'return_approved':
        return 'badge bg-success';
      case 'return_rejected':
        return 'badge bg-danger';
      case 'return_in_transit':
        return 'badge bg-primary';
      case 'return_received':
        return 'badge bg-secondary';
      case 'credit_note_created':
        return 'badge bg-purple text-white';
      case 'resolved':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  }
}
