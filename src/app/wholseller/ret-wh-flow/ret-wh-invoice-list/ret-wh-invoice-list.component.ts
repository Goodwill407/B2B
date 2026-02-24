import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-ret-wh-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './ret-wh-invoice-list.component.html',
  styleUrl: './ret-wh-invoice-list.component.scss'
})
export class RetWhInvoiceListComponent implements OnInit {

  invoiceList: any[] = []; // Array to hold the list of invoices
  first: number = 0;  // For pagination
  rows: number = 10;  // For pagination
  totalResults: number = 0;  // Total number of results for pagination
  loading: boolean = false; // Loading state
  currentPage: number = 1; // Current page number

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
    this.getInvoices();
  }

  getInvoices() {
    this.loading = true;

    // Wholesaler viewing their own invoices sent to retailers
    const wholesalerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-wholesaler-to-retailer?wholesalerEmail=${wholesalerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.invoiceList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
        console.log('Invoice List:', this.invoiceList);
        console.log('Total Results:', this.totalResults);
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
    this.getInvoices();
  }
}
