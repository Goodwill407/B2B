import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-view-retailerpo',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    MatTabsModule,
    BottomSideAdvertiseComponent,
    MatBadgeModule,
  ],
  templateUrl: './view-retailerpo.component.html',
  styleUrl: './view-retailerpo.component.scss'
})
export class ViewRetailerpoComponent {
  
  // Data arrays for different status tabs
  pendingData: any[] = [];
  partialData: any[] = [];
  makeToOrderData: any[] = [];
  confirmedData: any[] = [];

  // Pagination variables for each tab (page numbers)
  pagePending: number = 1;
  pagePartial: number = 1;
  pageConfirmed: number = 1;
  pageDelivered: number = 1;

  // Keep first values for paginator component
  firstPending: number = 0;
  firstPartial: number = 0;
  firstConfirmed: number = 0;
  firstDelivered: number = 0;

  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
  totalConfirmedResults: number = 0;
  totalDeliveredResults: number = 0;

  limit = 10;
  userProfile: any;

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
    this.route.queryParamMap.subscribe(params => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      
      // Load all tab data on init
      this.getPendingData();
      this.getPartialData();
      this.getMaketoOrderData();
      this.getConfirmedData();
    });
  }

  // Individual methods for each status
  getPendingData() {
    const page = this.pagePending;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-wholesaler?email=${this.authService.currentUserValue.email}&statusAll=pending&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results || [];
        this.totalPendingResults = res.totalResults || 0;
      });
  }

  getPartialData() {
    const page = this.pagePartial;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-wholesaler?email=${this.authService.currentUserValue.email}&statusAll=partial_delivery&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results || [];
        this.totalPartialResults = res.totalResults || 0;
      });
  }

  getMaketoOrderData() {
    const page = this.pageConfirmed;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-wholesaler?email=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=w_make_to_order&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.makeToOrderData = res.results || [];
        this.totalConfirmedResults = res.totalResults || 0;
      });
  }

  getConfirmedData() {
    const page = this.pageDelivered;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-wholesaler?email=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=wholesaler_confirmed&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.confirmedData = res.results || [];
        this.totalDeliveredResults = res.totalResults || 0;
      });
  }

  // Pagination handlers for each tab
  onPendingPageChange(event: any) {
    this.firstPending = event.first;
    this.pagePending = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getPendingData();
  }

  onPartialPageChange(event: any) {
    this.firstPartial = event.first;
    this.pagePartial = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getPartialData();
  }

  onConfirmedPageChange(event: any) {
    this.firstConfirmed = event.first;
    this.pageConfirmed = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getMaketoOrderData();
  }

  onDeliveredPageChange(event: any) {
    this.firstDelivered = event.first;
    this.pageDelivered = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getConfirmedData();
  }

  deleteSinglePo(id: any) {
    this.authService.delete('po-retailer-to-wholesaler', id).subscribe((res: any) => {
      this.communicationService.delete();
      // Refresh all tabs after deletion
      this.getPendingData();
      this.getPartialData();
      this.getMaketoOrderData();
      this.getConfirmedData();
    });
  }
}
