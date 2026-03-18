import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-return-list-wh',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './return-list-wh.component.html',
  styleUrl: './return-list-wh.component.scss'
})
export class ReturnListWhComponent implements OnInit {

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
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.getInvoices();
  }

  getInvoices(): void {
    this.loading = true;
    const wholesalerEmail = this.authService.currentUserValue.email;
    this.currentPage = Math.floor(this.first / this.rows) + 1;

    const url = `pi-manufacture-to-wholesaler?wholesalerEmail=${wholesalerEmail}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc&statusAll=delivered`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.invoiceList = res.results || [];
        this.totalResults = res.totalResults || 0;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching wholesaler invoices:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load manufacturer invoices');
      }
    );
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.getInvoices();
  }
}
