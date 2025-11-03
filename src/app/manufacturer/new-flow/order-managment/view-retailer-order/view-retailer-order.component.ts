import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { statusAllPoDisplayPipe } from 'app/statusAll-po';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-view-retailer-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    TooltipModule,
    MatTabsModule,
    statusAllPoDisplayPipe,
    MatBadgeModule,
  ],
  templateUrl: './view-retailer-order.component.html',
  styleUrl: './view-retailer-order.component.scss'
})
export class ViewRetailerOrderComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    orderNo: 'PO123',
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
    totalInWords: ''
  };

  // Data arrays
  pendingData: any[] = [];
  partialData: any[] = [];
  makeToOrderData: any[] = [];
  updatedData: any[] = [];

  // Pagination variables (changed to page numbers)
  pagePending: number = 1;
  pagePartial: number = 1;
  pageMakeToOrder: number = 1;
  pageUpdated: number = 1;

  // Keep first values for paginator component
  firstPending: number = 0;
  firstPartial: number = 0;
  firstMakeToOrder: number = 0;
  firstUpdated: number = 0;

  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
  totalMakeToOrderResults: number = 0;
  totalUpdatedResults: number = 0;

  limit = 10;
  email: string | null = null;
  productBy: string | null = null;
  userProfile: any;
  showFlag: boolean = false;
  isNewPO: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.userProfile.email;

      // Load all data on init
      this.getPendingData();
      this.getPartialData();
      this.getMakeToOrderData();
      this.getUpdatedData();
    });
  }

  // Individual methods for each statusAll (updated to use page parameter)
  getPendingData() {
    const page = this.pagePending;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=pending&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results;
        this.totalPendingResults = res.totalResults;
      });
  }

  getPartialData() {
    const page = this.pagePartial;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=m_partial_delivery&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results;
        this.totalPartialResults = res.totalResults;
      });
  }

  getMakeToOrderData() {
    const page = this.pageMakeToOrder;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=make_to_order&sortBy=createdAt:desc&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.makeToOrderData = res.results;
        this.totalMakeToOrderResults = res.totalResults;
      });
  }

  getUpdatedData() {
    const page = this.pageUpdated;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=m_order_confirmed&page=${page}&limit=${limit}`)
      .subscribe((res: any) => {
        this.updatedData = res.results;
        this.totalUpdatedResults = res.totalResults;
      });
  }

  // Pagination handlers (updated to calculate page numbers)
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

  onUpdatedPageChange(event: any) {
    this.firstUpdated = event.first;
    this.pageUpdated = Math.floor(event.first / event.rows) + 1;
    this.limit = event.rows;
    this.getUpdatedData();
  }

}
