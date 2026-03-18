import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-whl-group-credit-note-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    PaginatorModule,
    MatTabsModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './whl-group-credit-note-list.component.html',
  styleUrl: './whl-group-credit-note-list.component.scss'
})
export class WhlGroupCreditNoteListComponent implements OnInit {

  // Available Credit Notes
  availableData: any[] = [];
  firstAvailable: number = 0;
  totalAvailableResults: number = 0;

  // Wallet / Usage Data
  usedData: any[] = [];
  firstUsed: number = 0;
  totalUsedResults: number = 0;

  limit: number = 10;

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.getAvailableCreditNotes();
  }

  // Get Available Credit Notes (used=false) — mfg is logged in
  getAvailableCreditNotes() {
    const mfgEmail = this.authService.currentUserValue.email;
    const page = Math.floor(this.firstAvailable / this.limit) + 1;

    const url = `m-w-credit-note/group?manufacturerEmail=${mfgEmail}&page=${page}&limit=${this.limit}&used=false`;

    this.authService.get(url).subscribe(
      (res: any) => {
        if (res.success && res.result) {
          this.availableData = res.result.data || [];
          this.totalAvailableResults = res.result.totalCount || 0;
          console.log('Available Credit Notes:', this.availableData);
        }
      },
      (error) => {
        console.error('Error fetching available credit notes:', error);
        this.communicationService.customError1('Failed to load available credit notes');
      }
    );
  }

  // Get Wallet Usage Data — mfg viewing wholesaler wallets
  getUsedCreditNotes() {
    const mfgEmail = this.authService.currentUserValue.email;
    const page = Math.floor(this.firstUsed / this.limit) + 1;

    const url = `m-to-w-wallet?manufacturerEmail=${mfgEmail}&page=${page}&limit=${this.limit}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        if (res && res.results) {
          this.usedData = res.results || [];
          this.totalUsedResults = res.totalResults || 0;
          console.log('Wallet Data:', this.usedData);
        }
      },
      (error) => {
        console.error('Error fetching wallet data:', error);
        this.communicationService.customError1('Failed to load credit note usage data');
      }
    );
  }

  // Pagination handlers
  onAvailablePageChange(event: any) {
    this.firstAvailable = event.first;
    this.limit = event.rows;
    this.getAvailableCreditNotes();
  }

  onUsedPageChange(event: any) {
    this.firstUsed = event.first;
    this.limit = event.rows;
    this.getUsedCreditNotes();
  }

  // Tab change handler
  onTabChange(event: any) {
    if (event.index === 1 && this.usedData.length === 0) {
      this.getUsedCreditNotes();
    }
  }
}
