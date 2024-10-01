import { CommonModule, DatePipe, NgFor, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

export interface Company {
  name: string;
  introduction: string;
  factSheet: {
    established: string;
    founder: string;
    employees: string;
    headquarters: string;
    industry: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    linkedin: string;
  };
  brands: string[];
}



@Component({
  selector: 'app-view-manufacturer-details',
  standalone: true,
  imports: [NgFor, CommonModule, CustomDatePipe],
  templateUrl: './view-manufacturer-details.component.html',
  styleUrls: ['./view-manufacturer-details.component.scss'],
  providers: [DatePipe]
})

export class ViewManufacturerDetailsComponent {
  // Define a company variable of type Company
  company!: Company;
  email: any
  CompanyData: any
  brandsDetails: any
  cdnPath: any
  userProfile: any;
  WholsellerData: any;
  allVisabilityData: any;
  id: any;

  constructor(private route: ActivatedRoute, public authService: AuthService, private communicationService: CommunicationService,  private dialog: MatDialog,  private location: Location) {
    this.cdnPath = authService.cdnPath
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  // Initialize the company data in ngOnInit
  ngOnInit(): void {
    // Access the query parameter
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.email = params['email']
      this.getManufacturerData()
      this.getBrandsOfManufacturer()
      this.getUserProfileData()
      this.GetProfileVisabilityData()
    });

    this.company = {
      name: 'Your Company Name',
      introduction: 'This is a brief introduction of the company. It could include the mission, vision, or a short history.',
      factSheet: {
        established: 'January 1, 2000',
        founder: 'John Doe',
        employees: '500+',
        headquarters: 'City, Country',
        industry: 'Tech Industry'
      },
      contact: {
        address: '1234 Main St, City, Country',
        phone: '+1 234 567 890',
        email: 'info@yourcompany.com'
      },
      socialMedia: {
        facebook: 'https://facebook.com/yourcompany',
        twitter: 'https://twitter.com/yourcompany',
        linkedin: 'https://linkedin.com/company/yourcompany'
      },
      brands: ['Brand A', 'Brand B', 'Brand C']
    };
  }

  getManufacturerData() {
    this.authService.get(`manufacturers/${this.email}`).subscribe((res: any) => {
      if (res) {
        this.CompanyData = res
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {

      }
    })
  }

  getBrandsOfManufacturer() {
    this.authService.get(`brand/visible/brandlist/${this.email}/true`).subscribe((res: any) => {
      if (res) {
        this.brandsDetails = res
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {

      }
    })
  }

  sendRequestToManufacturer() {
    const requestBody = {
      fullName: this.CompanyData.fullName,
      companyName: this.CompanyData.companyName,
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
    }
    this.authService.post('request', requestBody).subscribe(
      response => {

        this.communicationService.showNotification('snackbar-success', 'Request added successfully', 'bottom', 'center');
      },
      error => {
        console.error('Error searching brand:', error);
        // Handle error accordingly
      }
    );
  }

  getUserProfileData() {
    this.authService.get(`wholesaler/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        this.WholsellerData = res

      } else {
        // Handle the case where there's no datap
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {

      }
    })
  }
  GetProfileVisabilityData() {
    this.authService.get(`manufacturers/visible-profile/${this.id}`).subscribe((res: any) => {
      if (res) {
        // res.registerOnFTH =res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
        this.allVisabilityData = res;
        const uniqueValues = {
          productType: new Set<string>(),
          gender: new Set<string>(),
          clothing: new Set<string>(),
          subCategory: new Set<string>()
        };
        
        const data = res.uniqueProducts.forEach((product: any) => {
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
      
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
        // this.getRegisteredUserData();
      }
    })
  }

  openImg(path:any,size:number){
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: size+'px',
      data: {path:path,width:size}  // Pass the current product data
    });
  }

  navigateFun() {
    this.location.back();
  }
}

