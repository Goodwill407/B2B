import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import {  RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
@Component({
  selector: 'app-view-wholsaler-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,RouterModule,
    TooltipModule,
        TableModule,
        MatTabsModule
  ],
  templateUrl: './view-wholsaler-order.component.html',
  styleUrl: './view-wholsaler-order.component.scss'
})
export class ViewWholsalerOrderComponent {
  purchaseOrder: any = {};
  email: string | null = null;
  userProfile: any;
  showFlag: boolean = false;

  // Separate data for both tabs
  pendingData: any[] = [];
  confirmedData: any[] = [];

  // Pagination variables
  totalPendingResults: number = 0;
  totalConfirmedResults: number = 0;
  
  limit: number = 10;
  pendingPage: number = 1;
  confirmedPage: number = 1;
  partialPage: number = 1;

  firstPending: number = 0;
  firstUpdated: number = 0;

  isNewPO: boolean = false;

  partialData: any[] = [];
  firstPartial: number = 0;
  totalPartialResults: number = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(() => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.getPendingData();
      this.getConfirmedData();
      this.getPartialData();
    });
  }

  // Fetch data for Pending tab
  getPendingData() {
    this.authService
      .get(`/po-wholesaler-to-manufacture?${this.authService.currentUserValue.email}&statusAll=pending&page=${this.pendingPage}&limit=${this.limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results;
        this.totalPendingResults = res.totalResults;
      });
  }

  // Fetch data for Updated tab
  getConfirmedData() {
    this.authService
      .get(`/po-wholesaler-to-manufacture?${this.authService.currentUserValue.email}&statusAll=m_order_confirmed&page=${this.confirmedPage}&limit=${this.limit}`)
      .subscribe((res: any) => {
        this.confirmedData = res.results;
        this.totalConfirmedResults = res.totalResults;
      });
  }

  // Fetch data for Updated tab
  getPartialData() {
    this.authService
      .get(`/po-wholesaler-to-manufacture?${this.authService.currentUserValue.email}&statusAll=m_partial_delivery&page=${this.partialPage}&limit=${this.limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results;
        this.totalPartialResults = res.totalResults;
      });
  }

  // Handle pagination change for Pending tab
  onPendingPageChange(event: any) {
    this.pendingPage = event.page + 1;
    this.limit = event.rows;
    this.getPendingData();
  }

  onPartialPageChange(event: any) {
    this.partialPage = event.page + 1;
    this.limit = event.rows;
    this.getPartialData();
}

  // Handle pagination change for Updated tab
  onConfirmedPageChange(event: any) {
    this.confirmedPage = event.page + 1;
    this.limit = event.rows;
    this.getConfirmedData();
  }
}
