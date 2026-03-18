import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-mfg-whl-credit-note-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './mfg-whl-credit-note-list.component.html',
  styleUrl: './mfg-whl-credit-note-list.component.scss'
})
export class MfgWhlCreditNoteListComponent implements OnInit {

  creditNoteList: any[] = [];
  first: number = 0;
  rows: number = 10;
  totalResults: number = 0;
  loading: boolean = false;
  currentPage: number = 1;

  // Route parameters
  manufacturerEmail: string = ''; // From route params (groupKey)
  used: boolean = false;
  wholesalerEmail: string = ''; // From auth service

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
    this.wholesalerEmail = this.authService.currentUserValue.email;

    this.route.params.subscribe(params => {
      this.manufacturerEmail = params['id']; // groupKey = manufacturerEmail
      console.log('Manufacturer Email:', this.manufacturerEmail);
    });

    this.route.queryParams.subscribe(queryParams => {
      this.used = queryParams['used'] === 'true';
      console.log('Used:', this.used);
      this.getCreditNotes();
    });
  }

  hasAnyUsedDate(): boolean {
    return this.creditNoteList.some(cn => cn.used && cn.usedAt);
  }

  getCreditNotes() {
    this.loading = true;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `m-w-credit-note?wholesalerEmail=${this.wholesalerEmail}&manufacturerEmail=${this.manufacturerEmail}&used=${this.used}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    console.log('API URL:', url);

    this.authService.get(url).subscribe(
      (res: any) => {
        this.creditNoteList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('Credit Note List:', this.creditNoteList);
      },
      (error) => {
        console.error('Error fetching credit notes:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load credit notes');
      }
    );
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getCreditNotes();
  }

  getTotalItems(set: any[]): number {
    if (!set || set.length === 0) return 0;
    return set.reduce((total, item) => total + (item.acceptedQuantity || 0), 0);
  }

  getUsedStatus(used: boolean): string {
    return used ? 'Used' : 'Available';
  }

  getUsedStatusClass(used: boolean): string {
    return used ? 'badge bg-secondary' : 'badge bg-success';
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  getPageTitle(): string {
    return this.used ? 'Used Credit Notes from Manufacturer' : 'Available Credit Notes from Manufacturer';
  }
}
