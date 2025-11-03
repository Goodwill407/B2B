import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { statusAllPoDisplayPipe } from "../../../../statusAll-po";
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-view-retailorpo-man',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    MatTabsModule,
    BottomSideAdvertiseComponent,
    statusAllPoDisplayPipe,
    MatBadgeModule,
  ],
  templateUrl: './view-retailorpo-man.component.html',
  styleUrl: './view-retailorpo-man.component.scss'
})
export class ViewRetailorpoManComponent {
  
  // Data arrays for different status tabs
  pendingData: any[] = [];
  partialData: any[] = [];
  makeToOrderData: any[] = [];
  confirmedData: any[] = [];

  // Pagination variables for each tab (changed to page numbers)
  pagePending: number = 1;
  pagePartial: number = 1;
  pageMakeToOrder: number = 1;
  pageConfirmed: number = 1;

  // Keep first values for paginator component
  firstPending: number = 0;
  firstPartial: number = 0;
  firstMakeToOrder: number = 0;
  firstConfirmed: number = 0;

  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
  totalMakeToOrderResults: number = 0;
  totalConfirmedResults: number = 0;

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
      this.getMakeToOrderData();
      this.getConfirmedData();
    });
  }

  // Individual methods for each status (updated to use page parameter)
  getPendingData() {
    const page = this.pagePending;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=pending&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results || [];
        this.totalPendingResults = res.totalResults || 0;
      });
  }

  getPartialData() {
    const page = this.pagePartial;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=m_partial_delivery&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results || [];
        this.totalPartialResults = res.totalResults || 0;
      });
  }

  getMakeToOrderData() {
    const page = this.pageMakeToOrder;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=make_to_order&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.makeToOrderData = res.results || [];
        this.totalMakeToOrderResults = res.totalResults || 0;
      });
  }

  getConfirmedData() {
    const page = this.pageConfirmed;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=m_order_confirmed&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.confirmedData = res.results || [];
        this.totalConfirmedResults = res.totalResults || 0;
      });
  }

  // Pagination handlers for each tab (updated to calculate page numbers)
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

  onMakeToOrderPageChange(event: any) {
    this.firstMakeToOrder = event.first;
    this.pageMakeToOrder = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getMakeToOrderData();
  }
  
  onConfirmedPageChange(event: any) {
    this.firstConfirmed = event.first;
    this.pageConfirmed = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getConfirmedData();
  }
}
