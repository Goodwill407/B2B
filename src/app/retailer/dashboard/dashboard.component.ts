import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BottomSideAdvertiseComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  userProfile: any;
  isLoading = true;

  // Network
  connectedManufacturersCount: number = 0;
  connectedWholesalersCount: number = 0;

  // Manufacturer Side (from manufacture-dashboard/all-counts)
  mfgPo: any = {};
  mfgInvoice: any = {};
  mfgReturns: any = {};
  mfgCreditNotes: any = {};

  // Wholesaler Side (from wholesaler-dashboard/dashboard-counts/retailer)
  whlPo: any = {};
  whlInvoice: any = {};
  whlReturns: any = {};
  whlCreditNotes: any = {};

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    const email = this.userProfile.email;
    const retailerId = this.userProfile.id;

    const mfgListReq = this.authService
      .get(`retailer/manufactureList/${retailerId}?page=1&limit=1&userCategory=orderwise`)
      .pipe(catchError(err => { console.error('Mfg List Failed', err); return of(null); }));

    const whListReq = this.authService
      .get(`retailer/wholesalerslist/${retailerId}?page=1&limit=1&userCategory=orderwise`)
      .pipe(catchError(err => { console.error('Wholesaler List Failed', err); return of(null); }));

    const allCountsReq = this.authService
      .get(`manufacture-dashboard/all-counts?email=${email}&role=retailer`)
      .pipe(catchError(err => { console.error('All Counts Failed', err); return of(null); }));

    const whDashReq = this.authService
      .get(`wholesaler-dashboard/dashboard-counts/retailer/${email}`)
      .pipe(catchError(err => { console.error('WH Dashboard Failed', err); return of(null); }));

    forkJoin({
      mfgList: mfgListReq,
      whList: whListReq,
      allCounts: allCountsReq,
      whDash: whDashReq
    }).subscribe({
      next: (res: any) => {

        // 1. Network Counts
        if (res.mfgList) this.connectedManufacturersCount = res.mfgList.totalDocs || 0;
        if (res.whList)  this.connectedWholesalersCount   = res.whList.totalDocs  || 0;

        // 2. Manufacturer Side
        if (res.allCounts?.data) {
          const d = res.allCounts.data;
          this.mfgPo          = d.poCounts?.retailerPO                 || {};
          this.mfgInvoice     = d.invoiceCounts?.invoiceDashboard       || {};
          this.mfgReturns     = d.returnCounts?.returnDashboard         || {};
          this.mfgCreditNotes = d.creditNoteCounts?.creditNoteDashboard || {};
        }

        // 3. Wholesaler Side
        if (res.whDash?.data?.retailerToWholesaler) {
          const w = res.whDash.data.retailerToWholesaler;
          this.whlPo          = w.po          || {};
          this.whlInvoice     = w.invoice     || {};
          this.whlReturns     = w.returns     || {};
          this.whlCreditNotes = w.creditNotes || {};
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Critical Dashboard Error:', err);
        this.isLoading = false;
      }
    });
  }

  get totalPayable(): number {
    return (this.mfgInvoice?.payableAmount || 0) + (this.whlInvoice?.payableAmount || 0);
  }

  get totalReturns(): number {
    return (this.mfgReturns?.total || 0) + (this.whlReturns?.total || 0);
  }

  get totalCreditUnused(): number {
    return (this.mfgCreditNotes?.unusedCreditAmount || 0) + (this.whlCreditNotes?.unusedCreditAmount || 0);
  }

  navigateTo(path: string) {
    if (path) this.router.navigate([path]);
  }
}