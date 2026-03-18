import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { statusAllPoDisplayPipe } from 'app/statusAll-po';

@Component({
  selector: 'app-view-wholsaler-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    TooltipModule,
    MatTabsModule,
    MatBadgeModule,
    statusAllPoDisplayPipe,
  ],
  templateUrl: './view-wholsaler-order.component.html',
  styleUrl: './view-wholsaler-order.component.scss'
})
export class ViewWholsalerOrderComponent implements OnInit {

  // Data arrays
  pendingData: any[] = [];
  partialData: any[] = [];
  makeToOrderData: any[] = [];
  confirmedData: any[] = [];

  // Page numbers
  pagePending: number = 1;
  pagePartial: number = 1;
  pageMakeToOrder: number = 1;
  pageConfirmed: number = 1;

  // First values for paginator
  firstPending: number = 0;
  firstPartial: number = 0;
  firstMakeToOrder: number = 0;
  firstConfirmed: number = 0;

  // Total results
  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
  totalMakeToOrderResults: number = 0;
  totalConfirmedResults: number = 0;

  limit: number = 10;
  userProfile: any;
  isNewPO: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(() => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.getPendingData();
      this.getPartialData();
      this.getMakeToOrderData();
      this.getConfirmedData();
    });
  }

  getPendingData() {
  const page = this.pagePending;
  this.authService
    .get(`/po-wholesaler-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=pending&page=${page}&limit=${this.limit}`)
    .subscribe((res: any) => {
      this.pendingData = res.results;
      this.totalPendingResults = res.totalResults;
    });
}

getPartialData() {
  const page = this.pagePartial;
  this.authService
    .get(`/po-wholesaler-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=m_partial_delivery&sortBy=createdAt:desc&page=${page}&limit=${this.limit}`)
    .subscribe((res: any) => {
      this.partialData = res.results;
      this.totalPartialResults = res.totalResults;
    });
}

getMakeToOrderData() {
  const page = this.pageMakeToOrder;
  this.authService
    .get(`/po-wholesaler-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=make_to_order&sortBy=createdAt:desc&page=${page}&limit=${this.limit}`)
    .subscribe((res: any) => {
      this.makeToOrderData = res.results;
      this.totalMakeToOrderResults = res.totalResults;
    });
}

getConfirmedData() {
  const page = this.pageConfirmed;
  this.authService
    .get(`/po-wholesaler-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=m_order_confirmed&sortBy=createdAt:desc&page=${page}&limit=${this.limit}`)
    .subscribe((res: any) => {
      this.confirmedData = res.results;
      this.totalConfirmedResults = res.totalResults;
    });
}


  // Pagination handlers
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
