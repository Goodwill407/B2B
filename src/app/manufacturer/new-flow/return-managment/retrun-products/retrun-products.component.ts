import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retrun-products',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retrun-products.component.html',
  styleUrl: './retrun-products.component.scss'
})
export class RetrunProductsComponent implements OnInit {

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
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.getReturnOrders();
  }

  getReturnOrders(): void {
    this.loading = true;
    const mfgEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `return-w2m?manufacturerEmail=${mfgEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.returnOrderList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching wholesaler return orders:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load return orders');
      }
    );
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.getReturnOrders();
  }

  getStatusDisplay(status: string): string {
    const statusMap: { [key: string]: string } = {
      'return_requested':   'Return Requested',
      'return_checked':     'Return Checked',
      'return_approved':    'Return Approved',
      'return_rejected':    'Return Rejected',
      'return_in_transit':  'Return In Transit',
      'return_received':    'Return Received',
      'credit_note_created':'Credit Note Created',
      'resolved':           'Resolved'
    };
    return statusMap[status] || status || 'N/A';
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'return_requested':   'badge bg-warning text-dark',
      'return_checked':     'badge bg-info text-dark',
      'return_approved':    'badge bg-success',
      'return_rejected':    'badge bg-danger',
      'return_in_transit':  'badge bg-primary',
      'return_received':    'badge bg-secondary',
      'credit_note_created':'badge bg-purple text-white',
      'resolved':           'badge bg-dark'
    };
    return classMap[status] || 'badge bg-secondary';
  }
}
