import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-mfg-proforma-invoice-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    RouterModule,
  ],
  templateUrl: './mfg-proforma-invoice-list.component.html',
  styleUrl: './mfg-proforma-invoice-list.component.scss'
})
export class MfgProformaInvoiceListComponent {

  proformaList: any[] = []; // Array to hold the list of proforma invoices
  isNewPO: boolean = false; // Add logic to set this based on your needs
  first: number = 0;  // For pagination
  rows: number = 10;  // For pagination
  totalResults: number = 0;  // Total number of results for pagination


  constructor(
    private route: ActivatedRoute,
    private authService: AuthService, 
    private communicationService: CommunicationService
  ){}

  ngOnInit(): void {
    this.getMfgProformaInvoices();
  }

getMfgProformaInvoices() {
  this.authService.get(`/perform-invoice?productBy=${this.authService.currentUserValue.email}&status=Dispatched`)
      .subscribe((res: any) => {
        this.proformaList = res.results || [];  // Store the results in proformaList
        this.totalResults = res.totalResults;  // Update total results for pagination
        console.log('Proforma List:', this.proformaList);
        console.log(res);  // Log the response for debugging
      }, (error) => {
        console.error('Error fetching proforma invoices:', error);
        // Handle error appropriately (e.g., show an error message)
      });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.getMfgProformaInvoices();  // You can also modify the API to include pagination if needed
  }

}
