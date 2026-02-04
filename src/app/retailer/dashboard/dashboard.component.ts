import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, GraphService } from '@core'; 
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { NgApexchartsModule } from 'ng-apexcharts';
// IMPORT THESE: catchError and of are crucial here
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgApexchartsModule,
    CommonModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  
   bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];
  
  public chartOptions: any;
  currentMonth: Date = new Date();
  userProfile: any;
  isLoading = true;

  // Data Objects - Initialize with defaults
  partnerCounts: any = {};
  
  // PO Data
  mfgPoData: any = { total: 12, pending: 2, confirmed: 8, partialDelivery: 1, makeToOrder: 0, delivered: 1 };
  
  // Wholesaler Data (Hardcoded)
  whPoData: any = { 
    total: 12, pending: 2, confirmed: 8, partialDelivery: 1, makeToOrder: 0, delivered: 1 
  };

  invoiceData: any = {};
  creditNoteData: any = {};
  returnData: any = {};

  // Placeholders
  wholesalerStats = {
    returnCount: 2,
    invoiceAmount: 15000,
    creditAmount: 5000
  };

  manufacturerStats = {
    payableAmount : 0,
    creditAmount: 0 
  };

  totalCreditAmount: number = 0;
  totalOutGoingReturns: number = 0;

  constructor(
    private graphService: GraphService,
    public authService: AuthService,
    private router: Router
  ) { 
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.chartOptions = this.graphService.getLineChartData();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    const email = this.userProfile.email;
    const role = 'retailer'; 
    const retailerId = this.userProfile.id; 

    // --- SAFELY PREPARE REQUESTS ---
    // .pipe(catchError(...)) ensures that if one fails, the others still load.

    // const partnerReq = this.authService.get(`retailer/partner-counts?retailerId=${retailerId}`)
    //   .pipe(catchError(err => { console.error('Partner API Failed', err); return of(null); }));

    // 1. Wholesalers Count (Using List API 'totalDocs')
  const whListReq = this.authService.get(`retailer/wholesalerslist/${retailerId}?page=1&limit=1&userCategory=orderwise`)
    .pipe(catchError(err => { console.error('Wholesaler List API Failed', err); return of(null); }));

  // 2. Manufacturers Count (Using List API 'totalDocs')
  const mfgListReq = this.authService.get(`retailer/manufactureList/${retailerId}?page=1&limit=1&userCategory=orderwise`)
    .pipe(catchError(err => { console.error('Mfg List API Failed', err); return of(null); }));

    const poReq = this.authService.get(`manufacture-dashboard/retailer-po-counts?email=${email}&role=${role}`)
      .pipe(catchError(err => { console.error('PO API Failed', err); return of(null); }));

    const returnReq = this.authService.get(`manufacture-dashboard/retailer-return-counts?email=${email}&role=${role}`)
      .pipe(catchError(err => { console.error('Return API Failed', err); return of(null); }));

    const invoiceReq = this.authService.get(`manufacture-dashboard/retailer-performa-invoice-counts?email=${email}&role=${role}`)
      .pipe(catchError(err => { console.warn('Invoice API Failed (Expected)', err); return of(null); }));

    const creditReq = this.authService.get(`manufacture-dashboard/retailer-credit-note-counts?email=${email}&role=${role}`)
      .pipe(catchError(err => { console.error('Credit API Failed', err); return of(null); }));

    forkJoin({
      // partners: partnerReq,
      whList: whListReq,   
      mfgList: mfgListReq,
      po: poReq,
      returns: returnReq,
      invoice: invoiceReq,
      credit: creditReq
    }).subscribe({
      next: (res: any) => {
        // console.log('API RESPONSES RECEIVED:', res); // This should now print!

        this.partnerCounts = {
        wholesalers: { total: 0 },
        manufacturers: { total: 0 }
      };

      // Assign Wholesaler Count from 'totalDocs'
      if (res.whList) {
         this.partnerCounts.wholesalers.total = res.whList.totalDocs || 0;
      }

      // Assign Manufacturer Count from 'totalDocs'
      if (res.mfgList) {
         this.partnerCounts.manufacturers.total = res.mfgList.totalDocs || 0;
      }

        // 1. PO Data
        if (res.po) {
           // Check both possible structures
           const poData = res.po.data?.retailerPO || res.po.retailerPO;
           if (poData) {
             this.mfgPoData = { ...poData };
           }
        }

        // 2. Returns Data
        if (res.returns) {
           const retData = res.returns.data?.returnDashboard || res.returns.returnDashboard;
           if (retData) {
             this.returnData = { ...retData };
             // Recalculate Total
             this.totalOutGoingReturns = (this.returnData.total || 0) + this.wholesalerStats.returnCount;
           }
        } else {
           // Fallback if API failed
           this.totalOutGoingReturns = this.wholesalerStats.returnCount;
        }

        // 3. Credit Note Data
        if (res.credit) {
            const credData = res.credit.data?.creditNoteDashboard || res.credit.creditNoteDashboard;
            if (credData) {
              this.creditNoteData = { ...credData };
              this.manufacturerStats.creditAmount = this.creditNoteData.unusedCreditAmount || 0;
            }
        }
        // Always recalc total credit (even if API failed, show hardcoded part)
        this.totalCreditAmount = this.manufacturerStats.creditAmount + this.wholesalerStats.creditAmount;

        // 4. Partner Counts
        if (res.partners) {
             this.partnerCounts = res.partners.data || res.partners || {};
        }

        // 5. Invoice Data
        if (res.invoice) {
            this.invoiceData = res.invoice.data?.invoiceDashboard || res.invoice.invoiceDashboard || {};
            this.manufacturerStats.payableAmount = this.invoiceData?.payableAmount;
        }

        this.isLoading = false;
      },
      error: (err) => {
        // This block should ideally NOT run now because we caught errors individually
        console.error('Critical Dashboard Error:', err);
        this.isLoading = false;
      }
    });
  }

  navigateTo(path: string) {
    if(path) this.router.navigate([path]);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
  }
}
