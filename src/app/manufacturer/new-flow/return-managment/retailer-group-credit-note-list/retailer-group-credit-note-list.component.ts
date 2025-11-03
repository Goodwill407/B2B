import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-retailer-group-credit-note-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    PaginatorModule,
    MatTabsModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retailer-group-credit-note-list.component.html',
  styleUrl: './retailer-group-credit-note-list.component.scss'
})
export class RetailerGroupCreditNoteListComponent implements OnInit {

  // Available Credit Notes
  availableData: any[] = [];
  firstAvailable: number = 0;
  totalAvailableResults: number = 0;
  
  // Used Credit Notes
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

  // Get Available Credit Notes (used=false)
  getAvailableCreditNotes() {
    const mfgEmail = this.authService.currentUserValue.email;
    const page = Math.floor(this.firstAvailable / this.limit) + 1;
    
    const url = `m-r-credit-note/group?manufacturerEmail=${mfgEmail}&page=${page}&limit=${this.limit}&used=false`;

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

  // Get Used Credit Notes (used=true)
  getUsedCreditNotes() {
    const mfgEmail = this.authService.currentUserValue.email;
    const page = Math.floor(this.firstUsed / this.limit) + 1;
    
    const url = `m-r-credit-note/group?manufacturerEmail=${mfgEmail}&page=${page}&limit=${this.limit}&used=true`;

    this.authService.get(url).subscribe(
      (res: any) => {
        if (res.success && res.result) {
          this.usedData = res.result.data || [];
          this.totalUsedResults = res.result.totalCount || 0;
          console.log('Used Credit Notes:', this.usedData);
        }
      },
      (error) => {
        console.error('Error fetching used credit notes:', error);
        this.communicationService.customError1('Failed to load used credit notes');
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
