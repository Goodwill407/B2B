import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfg-whl-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
  ],
  templateUrl: './mfg-whl-invoice-list.component.html',
  styleUrl: './mfg-whl-invoice-list.component.scss'
})
export class MfgWhlInvoiceListComponent implements OnInit {

  proformaList: any[] = [];
  first: number = 0;
  rows: number = 10;
  totalResults: number = 0;
  loading: boolean = false;
  currentPage: number = 1;

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

    // ✅ Wholesaler login → send wholesalerEmail
    const wholesalerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-manufacture-to-wholesaler?manufacturerEmail=${wholesalerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.proformaList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('W2M Invoice List:', this.proformaList);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load invoices');
      }
    );
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getWhlInvoices();
  }
}
