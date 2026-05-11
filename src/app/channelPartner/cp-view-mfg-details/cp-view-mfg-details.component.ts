import { CommonModule, DatePipe, NgFor, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cp-view-mfg-details',
  standalone: true,
  imports: [NgFor, CommonModule, CustomDatePipe, NgxSpinnerModule, BottomSideAdvertiseComponent],
  templateUrl: './cp-view-mfg-details.component.html',
  styleUrl: './cp-view-mfg-details.component.scss',
  providers: [DatePipe]
})
export class CpViewMfgDetailsComponent implements OnInit {

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  company: any;
  email: any;
  CompanyData: any;
  brandsDetails: any;
  userProfile: any;
  cpData: any;                     // ✅ replaces WholsellerData
  allVisabilityData: any;
  id: any;
  OnlyForView: any;
  isRequestSent: boolean = false;
  requestDetails: string | null = null;
  

  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private communicationService: CommunicationService,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.id = params['id'];
    this.email = params['email'];
    this.OnlyForView = params['isForView'];

    const manufacturerEmail = this.email;
    const requestByEmail = this.userProfile.email;

    // Parse RequestDetails
    const requestDetailsString = params['RequestDetails'];
    if (requestDetailsString) {
      const requestDetailsObject = JSON.parse(requestDetailsString);
      this.requestDetails = requestDetailsObject.status;
    }

    this.getManufacturerData();
    this.getBrandsOfManufacturer();
    this.getCpProfileData();

    // ✅ Always use email to get correct manufacturer id first
    this.getMnfIdForData();

    this.checkRequestStatus(manufacturerEmail, requestByEmail);
  });
}

  getManufacturerData() {
    this.authService.get(`manufacturers/${this.email}`).subscribe(
      (res: any) => { if (res) this.CompanyData = res; },
      error => console.error('Error fetching manufacturer data:', error)
    );
  }

  checkRequestStatus(manufacturerEmail: string, requestByEmail: string): void {
    const url = `request/check/status-request?wholsalerEmail=${manufacturerEmail}&requestByEmail=${requestByEmail}`;
    this.authService.get(url).subscribe(
      (response: any) => { this.requestDetails = response.status; },
      error => { this.requestDetails = null; }
    );
  }

  getBrandsOfManufacturer() {
    this.authService.get(`brand/visible/brandlist/${this.email}/true`).subscribe(
      (res: any) => { if (res) this.brandsDetails = res; },
      error => console.error('Error fetching brands:', error)
    );
  }

  // ✅ Only change #1 — fetch CP profile instead of wholesaler
  getCpProfileData() {
    this.authService.get(`channel-partner/email/${this.userProfile.email}`).subscribe(
      (res: any) => { if (res) this.cpData = res; },
      error => console.error('Error fetching CP profile:', error)
    );
  }

  // ✅ Only change #2 — use cpData instead of WholsellerData
  sendRequestToManufacturer() {
    const requestBody = {
      fullName:              this.CompanyData.fullName,
      companyName:           this.CompanyData.companyName,
      profileImg:            this.CompanyData.profileImg,
      email:                 this.CompanyData.email,
      code:                  this.CompanyData.code,
      mobileNumber:          this.CompanyData.mobNumber,
      requestByFullName:     this.cpData.fullName,
      requestByCompanyName:  this.cpData.companyName,
      requestByEmail:        this.cpData.email,
      requestByCountry:      this.cpData.country,
      requestByCity:         this.cpData.city,
      requestByState:        this.cpData.state,
      requestByCountryCode:  this.cpData.code,
      requestByMobileNumber: this.cpData.mobNumber,
      requestByRole:         this.userProfile.role,   // 'channel-partner'
      role:                  'Manufacturer',
      state:                 this.CompanyData.state,
      city:                  this.CompanyData.city,
      country:               this.CompanyData.country
    };

    this.authService.post('request', requestBody).subscribe(
      response => {
        this.communicationService.showNotification(
          'snackbar-success', 'Request added successfully', 'bottom', 'center'
        );
        this.checkRequestStatus(this.CompanyData.email, this.userProfile.email);
      },
      error => console.error('Error sending request:', error)
    );
  }

  GetProfileVisabilityData() {
  this.spinner.show();
  // ✅ Use visible-profile with correct id fetched from email
  this.authService.get(`manufacturers/visible-profile/${this.id}`).subscribe(
    (res: any) => {
      if (res) {
        this.allVisabilityData = res;
        const uniqueValues = {
          productType: new Set<string>(),
          gender:      new Set<string>(),
          clothing:    new Set<string>(),
          subCategory: new Set<string>()
        };
        if (res?.uniqueProducts && Array.isArray(res.uniqueProducts)) {
          res.uniqueProducts.forEach((product: any) => {
            uniqueValues.productType.add(product.productType);
            uniqueValues.gender.add(product.gender);
            uniqueValues.clothing.add(product.clothing);
            uniqueValues.subCategory.add(product.subCategory);
          });
        }
        this.allVisabilityData.dealingIn = {
          productType: Array.from(uniqueValues.productType).join(', '),
          gender:      Array.from(uniqueValues.gender).join(', '),
          clothing:    Array.from(uniqueValues.clothing).join(', '),
          subCategory: Array.from(uniqueValues.subCategory).join(', ')
        };
      }
      this.spinner.hide();
    },
    error => { this.spinner.hide(); }
  );
}

  openImg(path: any, size: number) {
    this.dialog.open(ImageDialogComponent, {
      width: size + 'px',
      data: { path: path, width: size }
    });
  }

  navigateFun() {
    this.location.back();
  }

  getMnfIdForData() {
  this.spinner.show();
  this.authService.get(`manufacturers/${this.email}`).subscribe(
    (res: any) => {
      if (res) {
        this.id = res.id;               // ✅ get correct manufacturer id from email
        this.GetProfileVisabilityData(); // ✅ then load visibility data
      }
      this.spinner.hide();
    },
    error => {
      this.spinner.hide();
      console.error('Error fetching manufacturer by email:', error);
    }
  );
}
}