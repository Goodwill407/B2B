import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-ret-credit-note-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './ret-credit-note-list.component.html',
  styleUrl: './ret-credit-note-list.component.scss'
})
export class RetCreditNoteListComponent implements OnInit {

  creditNoteList: any[] = []; // Array to hold the list of credit notes
  first: number = 0;  // For pagination
  rows: number = 10;  // For pagination
  totalResults: number = 0;  // Total number of results for pagination
  loading: boolean = false; // Loading state
  currentPage: number = 1; // Current page number

  // Route parameters
  retailerEmail: string = ''; // From route params (groupKey)
  used: boolean = false; // From query params
  manufacturerEmail: string = ''; // From auth service

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
    // Get manufacturer email from auth service
    this.manufacturerEmail = this.authService.currentUserValue.email;

    // Get retailer email from route params
    this.route.params.subscribe(params => {
      this.retailerEmail = params['id']; // The groupKey (retailer email)
      console.log('Retailer Email:', this.retailerEmail);
    });

    // Get 'used' parameter from query params
    this.route.queryParams.subscribe(queryParams => {
      this.used = queryParams['used'] === 'true'; // Convert string to boolean
      console.log('Used:', this.used);
      
      // Fetch credit notes after getting all parameters
      this.getCreditNotes();
    });
  }

  getCreditNotes() {
    this.loading = true;

    this.currentPage = Math.floor(this.first / this.rows) + 1;

    // Build API URL with retailerEmail, manufacturerEmail, and used parameters
    const url = `m-r-credit-note?manufacturerEmail=${this.manufacturerEmail}&retailerEmail=${this.retailerEmail}&used=${this.used}&page=${this.currentPage}&limit=${this.rows}&sortBy=createdAt:desc`;

    console.log('API URL:', url);

    this.authService.get(url).subscribe(
      (res: any) => {
        this.creditNoteList = res.results || [];  // Based on actual response structure
        this.totalResults = res.totalResults || 0; // Based on actual response structure
        this.loading = false;
        console.log('Credit Note List:', this.creditNoteList);
        console.log('Total Results:', this.totalResults);
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

  // Helper method to get total items in credit note
  getTotalItems(set: any[]): number {
    if (!set || set.length === 0) return 0;
    return set.reduce((total, item) => total + (item.acceptedQuantity || 0), 0);
  }

  // Helper method to check if credit note is used
  getUsedStatus(used: boolean): string {
    return used ? 'Used' : 'Available';
  }

  // Helper method to get used status class for styling
  getUsedStatusClass(used: boolean): string {
    return used ? 'badge bg-secondary' : 'badge bg-success';
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  // Helper method to get page title based on 'used' status
  getPageTitle(): string {
    return this.used ? 'Used Credit Notes' : 'Available Credit Notes';
  }
}
