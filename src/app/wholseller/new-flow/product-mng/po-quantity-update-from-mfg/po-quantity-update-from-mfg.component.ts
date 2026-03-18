import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { statusAllPoDisplayPipe } from "../../../../statusAll-po";

@Component({
  selector: 'app-po-quantity-update-from-mfg',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent,
    MatTabsModule,
    MatBadgeModule,
    statusAllPoDisplayPipe,
  ],
  templateUrl: './po-quantity-update-from-mfg.component.html',
  styleUrl: './po-quantity-update-from-mfg.component.scss'
})
export class PoQuantityUpdateFromMfgComponent {

  // -- Partial Delivery state
  partialData: any[] = [];
  totalPartialResults = 0;
  pagePartial = 1;
  firstPartial = 0;

  // -- Confirmed Delivery state
  confirmedData: any[] = [];
  totalConfirmedResults = 0;
  pageConfirmed = 1;
  firstConfirmed = 0;

  // -- Pending state
  pendingData: any[] = [];
  totalPendingResults = 0;
  pagePending = 1;
  firstPending = 0;

  // -- Make To Order state
  makeToOrderData: any[] = [];
  totalMakeToOrderResults = 0;
  pageMakeToOrder = 1;
  firstMakeToOrder = 0;

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

  // ─── API Calls (using original wholesaler API) ───────────────────────────

  getPendingData() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?email=${this.authService.currentUserValue.email}` +
        `&statusAll=pending&page=${this.pagePending}&limit=${this.limit}`
      )
      .subscribe((res: any) => {
        this.pendingData = res.results || [];
        this.totalPendingResults = res.totalResults || 0;
      });
  }

  getPartialData() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?email=${this.authService.currentUserValue.email}` +
        `&statusAll=m_partial_delivery&page=${this.pagePartial}&limit=${this.limit}`
      )
      .subscribe((res: any) => {
        this.partialData = res.results || [];
        this.totalPartialResults = res.totalResults || 0;
      });
  }

  getMakeToOrderData() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?email=${this.authService.currentUserValue.email}` +
        `&sortBy=createdAt:desc&statusAll=make_to_order&page=${this.pageMakeToOrder}&limit=${this.limit}`
      )
      .subscribe((res: any) => {
        this.makeToOrderData = res.results || [];
        this.totalMakeToOrderResults = res.totalResults || 0;
      });
  }

  getConfirmedData() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?email=${this.authService.currentUserValue.email}` +
        `&sortBy=createdAt:desc&statusAll=m_order_confirmed&page=${this.pageConfirmed}&limit=${this.limit}`
      )
      .subscribe((res: any) => {
        this.confirmedData = res.results || [];
        this.totalConfirmedResults = res.totalResults || 0;
      });
  }

  // ─── Pagination Handlers ──────────────────────────────────────────────────

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
