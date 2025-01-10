import { CommonModule, DatePipe, NgFor, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-manufacturer-details',
  standalone: true,
  imports: [NgFor, CommonModule, CustomDatePipe, NgxSpinnerModule],
  templateUrl: './view-manufacturer-details.component.html',
  styleUrls: ['./view-manufacturer-details.component.scss'],
  providers: [DatePipe]
})
export class ViewManufacturerDetailsComponent implements OnInit {
  company: any;
  email: any;
  CompanyData: any;
  brandsDetails: any;
  cdnPath: any;
  userProfile: any;
  WholsellerData: any;
  allVisabilityData: any;
  id: any;
  RequestDetails: any;
  OnlyForView: any;

  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    public authService: AuthService,
    private communicationService: CommunicationService,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.cdnPath = authService.cdnPath;
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    // Access the query parameters
    this.route.queryParams.subscribe(params => {
      console.log('Received query params:', params);

      this.id = params['id'];
      this.email = params['email'];
      this.OnlyForView = params['isForView'];

      // Parse RequestDetails
      if (params['RequestDetails']) {
        try {
          this.RequestDetails = JSON.parse(params['RequestDetails']);
          console.log('Parsed RequestDetails:', this.RequestDetails);
        } catch (error) {
          console.error('Error parsing RequestDetails:', error);
          this.RequestDetails = null;
        }
      } else {
        this.RequestDetails = null;
      }

      this.getManufacturerData();
      this.getBrandsOfManufacturer();
      this.getUserProfileData();

      if (!this.OnlyForView) {
        this.GetProfileVisabilityData();
      } else {
        this.getMnfIdForData();
      }
    });
  }

  // Fetch manufacturer data by email
  getManufacturerData() {
    this.authService.get(`manufacturers/${this.email}`).subscribe((res: any) => {
      if (res) {
        this.CompanyData = res;
      }
    }, error => {
      console.error('Error fetching manufacturer data:', error);
    });
  }

  // Fetch brands data for the manufacturer
  getBrandsOfManufacturer() {
    this.authService.get(`brand/visible/brandlist/${this.email}/true`).subscribe((res: any) => {
      if (res) {
        this.brandsDetails = res;
      }
    }, error => {
      console.error('Error fetching brands data:', error);
    });
  }

  // Send request to manufacturer
  sendRequestToManufacturer() {
    const requestBody = {
      fullName: this.CompanyData.fullName,
      companyName: this.CompanyData.companyName,
      profileImg: this.CompanyData.profileImg,
      email: this.CompanyData.email,
      code: this.CompanyData.code,
      mobileNumber: this.CompanyData.mobNumber,
      requestByFullName: this.WholsellerData.fullName,
      requestByCompanyName: this.WholsellerData.companyName,
      requestByEmail: this.WholsellerData.email,
      requestByCountry: this.WholsellerData.country,
      requestByCity: this.WholsellerData.city,
      requestByState: this.WholsellerData.state,
      requestByCountryCode: this.WholsellerData.code,
      requestByMobileNumber: this.WholsellerData.mobNumber,
      requestByRole: this.userProfile.role,
      role: "Manufacturer",
      state: this.CompanyData.state,
      city: this.CompanyData.city,
      country: this.CompanyData.country
    };

    this.authService.post('request', requestBody).subscribe(response => {
      this.communicationService.showNotification('snackbar-success', 'Request added successfully', 'bottom', 'center');
    }, error => {
      console.error('Error sending request:', error);
    });
  }

  // Get user profile data
  getUserProfileData() {
    this.authService.get(`wholesaler/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        this.WholsellerData = res;
      }
    }, error => {
      console.error('Error fetching wholesaler data:', error);
    });
  }

  // Get profile visibility data for a manufacturer
  GetProfileVisabilityData() {
    this.spinner.show();
    this.authService.get(`manufacturers/visible-profile/${this.id}`).subscribe((res: any) => {
      console.log('Received visibility data:', res);
      if (res) {
        this.allVisabilityData = res;

        // Handle unique products and grouping product types, gender, etc.
        const uniqueValues = {
          productType: new Set<string>(),
          gender: new Set<string>(),
          clothing: new Set<string>(),
          subCategory: new Set<string>()
        };

        res.uniqueProducts.forEach((product: any) => {
          uniqueValues.productType.add(product.productType);
          uniqueValues.gender.add(product.gender);
          uniqueValues.clothing.add(product.clothing);
          uniqueValues.subCategory.add(product.subCategory);
        });

        this.allVisabilityData.dealingIn = {
          productType: Array.from(uniqueValues.productType).join(', '),
          gender: Array.from(uniqueValues.gender).join(', '),
          clothing: Array.from(uniqueValues.clothing).join(', '),
          subCategory: Array.from(uniqueValues.subCategory).join(', ')
        };
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      console.error('Error fetching profile visibility data:', error);
    });
  }

  // Open image in dialog
  openImg(path: any, size: number) {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: size + 'px',
      data: { path: path, width: size }
    });
  }

  // Navigate back to the previous page
  navigateFun() {
    this.location.back();
  }

  // Fetch manufacturer data only for view (non-editable)
  getMnfIdForData() {
    this.spinner.show();
    this.authService.get(`manufacturers/${this.email}`).subscribe((res: any) => {
      if (res) {
        this.id = res.id;
        this.GetProfileVisabilityData();
      }
      this.spinner.hide();
    });
  }
}
