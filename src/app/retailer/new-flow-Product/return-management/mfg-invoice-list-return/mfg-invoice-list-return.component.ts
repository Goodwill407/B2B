import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-mfg-invoice-list-return',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './mfg-invoice-list-return.component.html',
  styleUrl: './mfg-invoice-list-return.component.scss'
})
export class MfgInvoiceListReturnComponent {


 invoiceList: any[] = []; // Array to hold the list of manufacturer invoices
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
    this.getMfgInvoices();
  }

  getMfgInvoices() {
    this.loading = true;

    // Updated API endpoint with retailer email parameter
    const retailerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-manufacture-to-retailer?retailerEmail=${retailerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc&statusAll=delivered`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.invoiceList = res.results || [];  // Based on actual response structure
        this.totalResults = res.totalResults || 0; // Based on actual response structure
        this.loading = false;
        console.log('Manufacturer Invoice List:', this.invoiceList);
        console.log('Total Results:', this.totalResults);
      },
      (error) => {
        console.error('Error fetching manufacturer invoices:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load manufacturer invoices');
      }
    );
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getMfgInvoices();
  }
}
