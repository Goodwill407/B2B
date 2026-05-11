import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cp-send-request-by-brand',
  standalone: true,
  imports: [
    BottomSideAdvertiseComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './cp-send-request-by-brand.component.html',
  styleUrl: './cp-send-request-by-brand.component.scss'
})
export class CpSendRequestByBrandComponent implements OnInit {

  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: '',
    country: '',
    state: '',
    city: ''
  };

  allBrand: any[] = [];
  allProductType: any[] = [];
  allSubCategory: any[] = [];
  allcategory: any[] = [];
  allGender = ['Men', 'Women', 'Boys', 'Girls'];

  userProfile: any;
  cpData: any;           // ✅ CP profile data (replaces WholsellerData)

  filteredSuggestions: string[] = [];
  noDataFound = false;
  brandData: any[] = [];
  SearchBrand: any;
  dataType: any;
  productTypeWise: any[] = [];

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private authService: AuthService,
    private route: Router,
    private communicationService: CommunicationService,
    private elementRef: ElementRef,
    private spinner: NgxSpinnerService
  ) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit() {
    this.getAllBrands();
    this.getProductType();
    this.getCpProfileData();   // ✅ fetch CP profile instead of wholesaler
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (clickedInside) {
      this.filteredSuggestions = [];
    }
  }

  onTabChange(tabName: string) {
    this.noDataFound = false;
    if (tabName === 'brand') {
      this.productTypeWise = [];
    } else if (tabName === 'product') {
      this.brandData = [];
    }
  }

  onBrandSearchChange(): void {
    if (this.SearchBrand) {
      const object = {
        brandName: this.SearchBrand,
        requestByEmail: this.userProfile.email
      };
      this.authService.post('brand/searchmanufacturelist', object).subscribe(
        response => {
          this.productTypeWise = [];
          this.brandData = response;
        },
        error => console.error('Error searching brand:', error)
      );
    }
    this.noDataFound = true;
  }

  getAllBrands() {
    this.authService.get(`brand?page=1`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getProductType() {
    this.authService.get(`producttype`).subscribe((res: any) => {
      this.allProductType = res.results;
    });
  }

  getCategoryByProductTypeAndGender() {
    const { productType, gender } = this.filters;
    this.authService.get(
      `sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`
    ).subscribe((res: any) => {
      this.allSubCategory = [];
      this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category)));
    });
  }

  getSubCategoryBYProductType_Gender_and_Category() {
    const { productType, gender, category } = this.filters;
    this.authService.post(`sub-category/filter`, { productType, gender, category })
      .subscribe((res: any) => {
        this.allSubCategory = [];
        this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
      });
  }

  GetProductTypeWiseManufacturar() {
    const body: any = {};
    if (this.filters.productType) body.productType = this.filters.productType;
    if (this.filters.gender)      body.gender = this.filters.gender;
    if (this.filters.category)    body.clothing = this.filters.category;
    if (this.filters.subCategory) body.subCategory = this.filters.subCategory;
    if (this.userProfile.email)   body.requestByEmail = this.userProfile.email;

    this.noDataFound = true;
    this.spinner.show();

    this.authService.post('products/manufracturelist/byproduct', body).subscribe(
      (res: any) => {
        this.brandData = [];
        this.productTypeWise = res;
        this.dataType = 'product';
        this.spinner.hide();
      },
      error => this.spinner.hide()
    );
  }

  // ✅ CP profile fetch — key difference from wholesaler version
  getCpProfileData() {
  this.authService.get(`channel-partner/email/${this.userProfile.email}`).subscribe(
    (res: any) => {
      console.log('CP Data:', res);   // ✅ Add this to verify
      if (res) this.cpData = res;
    },
    error => console.error('CP profile fetch error:', error)
  );
}

  // ✅ sendRequest uses cpData + role = channelPartner
sendRequestToManufacturer(ownerDetails: any) {

  // ✅ Guard check
  if (!this.cpData) {
    this.communicationService.showNotification(
      'snackbar-danger', 'Profile not loaded yet. Please try again.', 'bottom', 'center'
    );
    return;
  }

  const requestBody = {
    fullName:              ownerDetails.fullName,
    companyName:           ownerDetails.companyName,
    email:                 ownerDetails.email,
    code:                  ownerDetails.code,
    mobileNumber:          ownerDetails.mobNumber,
    requestByFullName:     this.cpData.fullName,
    requestByCompanyName:  this.cpData.companyName,
    requestByEmail:        this.cpData.email,
    requestByCountry:      this.cpData.country,
    requestByCity:         this.cpData.city,
    requestByState:        this.cpData.state,
    requestByCountryCode:  this.cpData.code,
    requestByMobileNumber: this.cpData.mobNumber,
    requestByRole:         this.userProfile.role,   // 'channelPartner'
    role:                  'Manufacturer',
    state:                 ownerDetails.state,
    city:                  ownerDetails.city,
    country:               ownerDetails.country
  };

  this.spinner.show();
  this.authService.post('request', requestBody).subscribe(
    response => {
      this.communicationService.showNotification(
        'snackbar-success', 'Request sent successfully', 'bottom', 'center'
      );
      if (response) this.GetProductTypeWiseManufacturar();
      this.spinner.hide();
    },
    error => this.spinner.hide()
  );
}

  navigateToProfile(id: string, email: any, requestDetailsObject: any) {
    // ✅ CP route instead of wholesaler route
    this.route.navigate(['/cp/view-mfg-details'], {
      queryParams: {
        id: id,
        email: email,
        RequestDetails: JSON.stringify(requestDetailsObject)
      }
    });
  }

  onSearchBrandChange() {
    if (this.SearchBrand) {
      this.authService.post('brand/searchmanufacturelist', { brandName: this.SearchBrand })
        .subscribe(
          (response: any[]) => {
            this.filteredSuggestions = response.map((item: any) => item.brandName);
          },
          error => console.error('Error searching brand:', error)
        );
    }
  }

  selectSuggestion(suggestion: string) {
    this.SearchBrand = suggestion;
    this.filteredSuggestions = [];
  }
}