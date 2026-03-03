import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-wh-invoice-list-return',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './wh-invoice-list-return.component.html',
  styleUrl: './wh-invoice-list-return.component.scss'
})
export class WhInvoiceListReturnComponent implements OnInit {

  invoiceList: any[] = [];
  first: number = 0;
  rows: number = 10;
  totalResults: number = 0;
  loading: boolean = false;
  currentPage: number = 1;

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
    this.getWhlInvoices();
  }

  getWhlInvoices() {
    this.loading = true;

    const retailerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-wholesaler-to-retailer?retailerEmail=${retailerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc&statusAll=delivered`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.invoiceList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('Wholesaler Invoice List:', this.invoiceList);
        console.log('Total Results:', this.totalResults);
      },
      (error) => {
        console.error('Error fetching wholesaler invoices:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load wholesaler invoices');
      }
    );
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getWhlInvoices();
  }
}
