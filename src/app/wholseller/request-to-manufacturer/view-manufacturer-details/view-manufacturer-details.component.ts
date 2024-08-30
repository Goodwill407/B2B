import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

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
  imports:[NgFor],
  templateUrl: './view-manufacturer-details.component.html',
  styleUrls: ['./view-manufacturer-details.component.scss']
})
export class ViewManufacturerDetailsComponent  {
  // Define a company variable of type Company
  company!: Company;
  email:any
  CompanyData:any
  brandsDetails:any
  cdnPath:any
  userProfile:any;
  WholsellerData:any;

  constructor(private route: ActivatedRoute, private authService:AuthService,private communicationService:CommunicationService) {
    this.cdnPath=authService.cdnPath
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  // Initialize the company data in ngOnInit
  ngOnInit(): void {
     // Access the query parameter
     this.route.queryParams.subscribe(params => {
      this.email = params['email'];   
      console.log(this.email)   
      this.getManufacturerData()
      this.getBrandsOfManufacturer()
      this.getUserProfileData() 
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

  getManufacturerData(){   
      this.authService.get(`manufacturers/${this.email}`).subscribe((res: any) => {
        if (res) {
          this.CompanyData=res
        } else {
        }
      }, error => {
        if (error.error.message === "Manufacturer not found") {
          
        }
      })
    }

    getBrandsOfManufacturer(){
      this.authService.get(`brand/brandlist/${this.email}`).subscribe((res: any) => {
        if (res) {
          this.brandsDetails=res
        } else {
        }
      }, error => {
        if (error.error.message === "Manufacturer not found") {
          
        }
      })
    }

    sendRequestToManufacturer(){  
      const requestBody={
        fullName : this.CompanyData.fullName ,
        companyName: this.CompanyData.companyName,
        email:  this.CompanyData.email,
        code:  this.CompanyData.code,
        mobileNumber:  this.CompanyData.mobNumber,
        requestByFullName: this.WholsellerData.fullName,
        requestByCompanyName: this.WholsellerData.companyName,
        requestByEmail: this.WholsellerData.email,
        requestByCountry: this.WholsellerData.country,
        requestByCity: this.WholsellerData.city,
        requestByState: this.WholsellerData.state,
        requestByCountryCode:this.WholsellerData.code,
        requestByMobileNumber:this.WholsellerData.mobNumber,
        requestByRole: this.userProfile.role,
        role: "Manufacturer" ,
        state:  this.CompanyData.state,
        city:  this.CompanyData.city,
        country:  this.CompanyData.country
      }
    this.authService.post('request',requestBody).subscribe(
      response => {        
           
        this.communicationService.showNotification('snackbar-success', 'Request added successfully','bottom','center');
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
       this.WholsellerData=res
        
      } else {
        // Handle the case where there's no datap
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
  
      }
    })
  }
    

  }

