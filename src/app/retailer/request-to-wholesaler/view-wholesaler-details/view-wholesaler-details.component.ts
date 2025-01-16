import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';



@Component({
  selector: 'app-view-wholesaler-details',
  standalone: true,
  imports: [NgFor, CommonModule, CustomDatePipe],
  templateUrl: './view-wholesaler-details.component.html',
  styleUrl: './view-wholesaler-details.component.scss'
})
export class ViewWholesalerDetailsComponent {

    // Define a company variable of type Company
    company!: any
    email:any
    CompanyData:any
    brandsDetails:any
    cdnPath:any
    userProfile:any;
    WholsellerData:any; 
    RetailserData:any
    id:any
    // RequestDetails:any
    isRequestSend:boolean=false;
    requestDetails:any;
    isRequestSent = false;
  
    constructor(private route: ActivatedRoute, private authService:AuthService,private communicationService:CommunicationService) {
      this.cdnPath=authService.cdnPath
      this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    }
  
    // Initialize the company data in ngOnInit
    ngOnInit(): void {
       // Access the query parameter
       this.route.queryParams.subscribe(params => {
        this.id = params['id']; 
        this.email=params['email']    
        const wholesalerEmail = this.email; // Replace with dynamic value
        const requestByEmail = this.userProfile.email; // Assume userProfile is already available
        this.checkRequestStatus(wholesalerEmail, requestByEmail);
        // if (params['RequestDetails']) {
        //   console.log('RequestDetails before parsing:', params['RequestDetails']);
        //   try {
        //     this.RequestDetails = JSON.parse(params['RequestDetails']); // Try parsing
        //     console.log('Parsed RequestDetails:', this.RequestDetails); // Log the parsed object
        //   } catch (error) {
        //     console.error('Error parsing RequestDetails:', error);
        //     this.RequestDetails = null; // Handle error
        //   }
        // } else {
        //   this.RequestDetails = null;
        // }
        // this.getBrandsOfManufacturer()
        this.getWholesalerProfileData()
       this.getRetailerProfileData() 
        
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
  
      sendRequestToWholesaler(){  
        this.isRequestSent = true; // Disable the button immediately
        const requestBody={
          fullName : this.WholsellerData.fullName ,
          companyName: this.WholsellerData.companyName,
          email:  this.WholsellerData.email,
          code:  this.WholsellerData.code,
          mobileNumber:  this.WholsellerData.mobNumber,
          requestByFullName: this.RetailserData.fullName,
          requestByCompanyName: this.RetailserData.companyName,
          requestByEmail: this.RetailserData.email,
          requestByCountry: this.RetailserData.country,
          requestByCity: this.RetailserData.city,
          requestByState: this.RetailserData.state,
          requestByCountryCode:this.RetailserData.code,
          requestByMobileNumber:this.RetailserData.mobNumber,
          requestByRole: this.userProfile.role,
          role: "Wholesaler" ,
          state:  this.WholsellerData.state,
          city:  this.WholsellerData.city,
          country:  this.WholsellerData.country
        }
      this.authService.post('request',requestBody).subscribe(
        response => {        
             if(response){
              this.isRequestSend=true;
             }
          this.communicationService.showNotification('snackbar-success', 'Request added successfully','bottom','center');
        },
        error => {
          this.communicationService.showNotification(
          'snackbar-error',error.error.message , 'bottom','center');
        }
      );
    }
    getRetailerProfileData(){
      this.authService.get(`retailer/${this.userProfile.email}`).subscribe((res: any) => {
        if (res) {
         this.RetailserData=res
          
        } else {
          // Handle the case where there's no datap
        }
      }, error => {
        if (error.error.message === "Manufacturer not found") {
    
        }
      })
    }
  
    getWholesalerProfileData() {
      this.authService.get(`wholesaler/${this.email}`).subscribe((res: any) => {
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
   

    checkRequestStatus(wholesalerEmail: string, requestByEmail: string): void {
      const url = `request/check/status-request?wholsalerEmail=${wholesalerEmail}&requestByEmail=${requestByEmail}`;
      this.authService.get(url).subscribe(
        (response: any) => {
          this.requestDetails = response.status;
        },
        (error) => {
          console.error('Error checking request status:', error);
          this.requestDetails = null; // Handle error accordingly
        }
      );
    }
    

}
