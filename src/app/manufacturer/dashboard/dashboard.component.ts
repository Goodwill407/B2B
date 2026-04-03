import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  userProfile: any;
  isLoading = true;

  retailerPoData: any = {};
  wholesalerPoData: any = {};
  productData: any = {};
  retailerInvoiceData: any = {};
  wholesalerInvoiceData: any = {};
  retailerReturnCounts: any = {};
  wholesalerReturnCounts: any = {};
  creditNoteData: any = {};
  wholesalerCreditNotes: any = {};
  invitationData: any = {};
  inventoryData: any = {};
  retailersData: any = {};
  wholesalersData: any = {};

  connectedRetailersCount = 0;
  connectedWholesalersCount = 0;
  pendingInvitesCount = 0;

  brands: any[] = [];
  brandsCount = 0;
  page = 1;
  limit = 10;

  requestData: any = {};

  constructor(public authService: AuthService, private router: Router) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.getAllBrands();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const { email } = this.userProfile;

    forkJoin({
      retailer: this.authService.get(`manufacture-dashboard/all-counts?email=${email}&role=manufacture`),
      wholesaler: this.authService.get(`wholesaler-dashboard/dashboard-counts/manufacture/${email}`)
    }).subscribe({
      next: (res: any) => {
        const d = res.retailer.data;
        const w = res.wholesaler.data?.wholesalerToManufacturer || {};

        this.retailerPoData       = d.poCounts?.retailerPO                 || {};
        this.productData          = d.productCounts?.productDashboard       || {};
        this.retailerInvoiceData  = d.invoiceCounts?.invoiceDashboard       || {};
        this.retailerReturnCounts = d.returnCounts?.returnDashboard         || {};
        this.creditNoteData       = d.creditNoteCounts?.creditNoteDashboard || {};
        this.invitationData       = d.invitationCounts?.invitations         || {};
        this.pendingInvitesCount  = this.invitationData.pending             || 0;
        this.inventoryData        = d.inventoryCounts                       || {};

        const network = d.referredUsersCounts || {};
        this.retailersData             = network.retailers   || {};
        this.wholesalersData           = network.wholesalers || {};
        this.connectedRetailersCount   = this.retailersData.total   || 0;
        this.connectedWholesalersCount = this.wholesalersData.total || 0;

        this.wholesalerPoData       = w.po          || {};
        this.wholesalerInvoiceData  = w.invoice      || {};
        this.wholesalerReturnCounts = w.returns      || {};
        this.wholesalerCreditNotes  = w.creditNotes  || {};

        this.requestData = d.requestCounts?.requests || {};

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Dashboard Error:', err);
        this.isLoading = false;
      }
    });
  }

  getAllBrands(): void {
    this.authService
      .get(`brand?page=${this.page}&limit=${this.limit}&brandOwner=${this.userProfile.email}`)
      .subscribe({
        next: (res: any) => {
          this.brands      = res.results      || [];
          this.brandsCount = res.totalResults || 0;
        },
        error: (err) => console.error('Error loading brands', err)
      });
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/no-image.png';
  }

  navigateTo(path: string): void {
    if (path) this.router.navigate([path]);
  }
}
