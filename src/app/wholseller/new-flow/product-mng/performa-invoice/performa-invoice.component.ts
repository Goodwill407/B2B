import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-performa-invoice',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    AccordionModule,
    RouterModule,
    PaginatorModule,
    BottomSideAdvertiseComponent,
  ],
  templateUrl: './performa-invoice.component.html',
  styleUrl: './performa-invoice.component.scss',
})
export class PerformaInvoiceComponent implements OnInit {

  proformaList: any[] = [];
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
  ) {}

  ngOnInit(): void {
    this.getWhlInvoices();
  }

  getWhlInvoices() {
    this.loading = true;

    // ✅ Wholesaler login → use wholesalerEmail
    const wholesalerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-manufacture-to-wholesaler?wholesalerEmail=${wholesalerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.proformaList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('M2W Invoice List:', this.proformaList);
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
