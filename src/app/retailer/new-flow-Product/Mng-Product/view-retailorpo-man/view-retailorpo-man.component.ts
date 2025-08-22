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
    statusAllPoDisplayPipe
  ],
  templateUrl: './view-retailorpo-man.component.html',
  styleUrl: './view-retailorpo-man.component.scss'
})
export class ViewRetailorpoManComponent {
  
  // Data arrays for different status tabs
  pendingData: any[] = [];
  partialData: any[] = [];
  confirmedData: any[] = [];

  // Pagination variables for each tab
  firstPending: number = 0;
  firstPartial: number = 0;
  firstConfirmed: number = 0;

  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
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
      this.getConfirmedData();
    });
  }

  // Individual methods for each status
  getPendingData() {
    const skip = this.firstPending;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=pending&skip=${skip}&limit=${limit}`)
      .subscribe((res: any) => {
        this.pendingData = res.results || [];
        this.totalPendingResults = res.totalResults || 0;
      });
  }

  getPartialData() {
    const skip = this.firstPartial;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=m_partial_delivery&skip=${skip}&limit=${limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results || [];
        this.totalPartialResults = res.totalResults || 0;
      });
  }

  getConfirmedData() {
    const skip = this.firstConfirmed;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?email=${this.authService.currentUserValue.email}&statusAll=m_order_confirmed&skip=${skip}&limit=${limit}`)
      .subscribe((res: any) => {
        this.confirmedData = res.results || [];
        this.totalConfirmedResults = res.totalResults || 0;
      });
  }

  // Pagination handlers for each tab
  onPendingPageChange(event: any) {
    this.firstPending = event.first;
    this.limit = event.rows;
    this.getPendingData();
  }

  onPartialPageChange(event: any) {
    this.firstPartial = event.first;
    this.limit = event.rows;
    this.getPartialData();
  }

  onConfirmedPageChange(event: any) {
    this.firstConfirmed = event.first;
    this.limit = event.rows;
    this.getConfirmedData();
  }
}
