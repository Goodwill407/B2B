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
  connectedRetailersCount: number = 0;
  connectedManufacturersCount: number = 0;

  // Inventory
lowStockDesigns: number = 0;
totalDesigns: number = 0;

  // Retailer → Wholesaler
  retailerPo: any = {};
  retailerInvoice: any = {};
  retailerReturns: any = {};
  retailerCreditNotes: any = {};

  // Wholesaler → Manufacturer
  mfgPo: any = {};
  mfgInvoice: any = {};
  mfgReturns: any = {};
  mfgCreditNotes: any = {};

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

    const whlDashReq = this.authService
      .get(`wholesaler-dashboard/dashboard-counts/wholesaler/${email}`)
      .pipe(catchError(err => { console.error('WHL Dashboard failed', err); return of(null); }));

    const retListReq = this.authService
      .get(`wholesaler/get-referred/retailer?page=1&limit=1&refByEmail=${email}`)
      .pipe(catchError(err => { console.error('Retailer list failed', err); return of(null); }));

    const mfgListReq = this.authService
      .get(`wholesaler/manufactureList/${email}?page=1&limit=1&userCategory=orderwise`)
      .pipe(catchError(err => { console.error('Manufacturer list failed', err); return of(null); }));

    forkJoin({
      whlDash: whlDashReq,
      retList: retListReq,
      mfgList: mfgListReq,
    }).subscribe({
      next: (res: any) => {

        if (res.whlDash?.data) {
          const r2w = res.whlDash.data.retailerToWholesaler;
          const w2m = res.whlDash.data.wholesalerToManufacturer;

          this.retailerPo          = r2w?.po          || {};
          this.retailerInvoice     = r2w?.invoice     || {};
          this.retailerReturns     = r2w?.returns     || {};
          this.retailerCreditNotes = r2w?.creditNotes || {};

          this.mfgPo               = w2m?.po          || {};
          this.mfgInvoice          = w2m?.invoice     || {};
          this.mfgReturns          = w2m?.returns     || {};
          this.mfgCreditNotes      = w2m?.creditNotes || {};
        }

        if (res.retList)   this.connectedRetailersCount     = res.retList.totalResults || 0;
        if (res.mfgList)   this.connectedManufacturersCount = res.mfgList.totalDocs    || 0;
        
        const inv = res.whlDash.data.inventory;
        this.lowStockDesigns    = inv?.lowStockDesigns  || 0;
        this.totalDesigns = inv?.totalDesigns  || 0;

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Critical Dashboard Error:', err);
        this.isLoading = false;
      }
    });
  }

  navigateTo(path: string) {
    if (path) this.router.navigate([path]);
  }
}