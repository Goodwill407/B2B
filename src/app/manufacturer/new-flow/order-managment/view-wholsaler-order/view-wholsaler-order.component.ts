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
  updatedData: any[] = [];

  // Pagination variables
  totalPendingResults: number = 0;
  totalUpdatedResults: number = 0;
  
  limit: number = 10;
  pendingPage: number = 1;
  updatedPage: number = 1;

  firstPending: number = 0;
  firstUpdated: number = 0;

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
      this.getUpdatedData();
    });
  }

  // Fetch data for Pending tab
  getPendingData() {
    this.authService
      .get(`/type2-purchaseorder?productBy=${this.authService.currentUserValue.email}&status=pending&page=${this.pendingPage}&limit=${this.limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results;
        this.totalPendingResults = res.totalResults;
      });
  }

  // Fetch data for Updated tab
  getUpdatedData() {
    this.authService
      .get(`/type2-purchaseorder?productBy=${this.authService.currentUserValue.email}&status=updated&page=${this.updatedPage}&limit=${this.limit}`)
      .subscribe((res: any) => {
        this.updatedData = res.results;
        this.totalUpdatedResults = res.totalResults;
      });
  }

  // Handle pagination change for Pending tab
  onPendingPageChange(event: any) {
    this.pendingPage = event.page + 1;
    this.limit = event.rows;
    this.getPendingData();
  }

  // Handle pagination change for Updated tab
  onUpdatedPageChange(event: any) {
    this.updatedPage = event.page + 1;
    this.limit = event.rows;
    this.getUpdatedData();
  }
}
