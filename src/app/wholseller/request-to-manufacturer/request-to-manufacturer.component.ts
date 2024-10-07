import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { AuthServiceService } from 'auth-service.service';

@Component({
  selector: 'app-request-to-manufacturer',
  standalone: true,
  imports: [
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './request-to-manufacturer.component.html',
  styleUrl: './request-to-manufacturer.component.scss'
})
export class RequestToManufacturerComponent {

  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: '',
    country:'',
    state:'',
    city:''
  };

  allBrand:any[]=[];
  allProductType:any[]=[];
  allSubCategory:any[]=[];
  allcategory:any[]=[];
  allGender = ['Men', 'Women', 'Boys', 'Girls'];
  userProfile:any;
  WholsellerData:any
  filteredSuggestions: string[] = [];


  brandData:any[]=[];
  cdnPath:any
  SearchBrand:any;
  dataType:any;
  productTypeWise: any[] = [];

   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';

  constructor(private authService:AuthService, private route:Router, private communicationService:CommunicationService, private elementRef: ElementRef ){
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(){
    this.cdnPath = this.authService.cdnPath;
    this.getAllBrands()
    this.getProductType()
    this.getProductType()
    this.getUserProfileData()
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Clear suggestions if click is outside the input box or suggestions list
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (clickedInside) {
      this.filteredSuggestions = [];
    }
  }

  // clear data after change Tab
  onTabChange(tabName: string) {
    if (tabName === 'brand') {
      this.productTypeWise = [];  // Clear product array when switching to brand tab
    } else if (tabName === 'product') {
      this.brandData = [];  // Clear brand array when switching to product tab
    }
  }


  onBrandSearchChange(): void {
    if (this.SearchBrand) {

      const object={
        brandName:this.SearchBrand
      }
      this.authService.post('brand/searchmanufacturelist',object).subscribe(
        response => {    
          this.productTypeWise=[] 
          this.brandData=response
          // Handle the response as needed, e.g., update the UI
        },
        error => {
          console.error('Error searching brand:', error);
          // Handle error accordingly
        }
      );
    }   
  }  

  // Filter Master
  getAllBrands() {
    this.authService.get(`brand?page=1`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getProductType(){   
    this.authService.get(`producttype`).subscribe((res: any) => {
      this.allProductType = res.results;
    });
  }

  getCategoryByProductTypeAndGender(){
    const productType=this.filters.productType
    const gender=this.filters.gender

    this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`).subscribe((res:any)=>{
      if(res){
        this.allSubCategory=[]
      }
      this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category)));      
    },error=>{

    })
  }

  getSubCategoryBYProductType_Gender_and_Category(){
    const productType = this.filters.productType;
    const gender = this.filters.gender;
    const category = this.filters.category;

    const object = {
      productType,
      gender,
      category
    };

    this.authService.post(`sub-category/filter`, object).subscribe((res:any)=>{
      if(res){
        this.allSubCategory=[]
      }
      this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));      
    },error=>{

    })

  }

  GetProductTypeWiseManufacturar() {
    let url = `products/manufracturelist/byproduct`;
  
    // Construct the body object dynamically
    const body: any = {}; // Initialize an empty object
  
    // Check each filter and add to the body if it has a value
    if (this.filters.productType) {
      body.productType = this.filters.productType;
    }
    if (this.filters.gender) {
      body.gender = this.filters.gender;
    }
    if (this.filters.category) {
      body.clothing = this.filters.category; // Assuming "category" is mapped to "clothing"
    }
    if (this.filters.subCategory) {
      body.subCategory = this.filters.subCategory;
    }   
    // if (this.filters.country) {
    //   body.country = this.filters.country;
    // }
    // if (this.filters.city) {
    //   body.city = this.filters.city;
    // }
    // if (this.filters.state) {
    //   body.state = this.filters.state;
    // }
  
    // Call the API with the dynamically constructed body
    this.authService.post(url, body).subscribe(
      (res: any) => {
        this.brandData=[]
       this.productTypeWise=res 
       this.dataType="product"     
      },
      (error) => {
        console.log('Error:', error);
      }
    );
  }
  

  onFilterChange(data1:any,data2:any){
      this.dataType="brand"
    const object={
      brandName:this.SearchBrand
    }
    this.authService.post('products/manufracturelist/byproduct',object).subscribe(
      response => {        
        this.brandData=response       
        // Handle the response as needed, e.g., update the UI
      },
      error => {
        console.error('Error searching brand:', error);
        // Handle error accordingly
      }
    );
  }

  navigateToProfile(id: string,email:any) {
    // Navigate to the target route with email as query parameter
    this.route.navigate(['/wholesaler/mnf-details'], { queryParams: { id: id ,email:email } });
  }

  sendRequestToManufacturer(ownerDetails:any){  
    const requestBody={
      fullName : ownerDetails.fullName ,
      companyName: ownerDetails.companyName,
      email:  ownerDetails.email,
      code:  ownerDetails.code,
      mobileNumber:  ownerDetails.mobNumber,
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
      state:  ownerDetails.state,
      city:  ownerDetails.city,
      country:  ownerDetails.country
    }
  this.authService.post('request',requestBody).subscribe(
    response => {        
      this.brandData=response       
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

onSearchBrandChange() {
  if (this.SearchBrand) {
    const object = {
      brandName: this.SearchBrand
    };

    this.authService.post('brand/searchmanufacturelist', object).subscribe(
      (response: any[]) => { 
       this.filteredSuggestions = response.map((item: any) => item.brandName); // Extract 'brandName' from each item
        // Handle the response as needed, e.g., update the UI
      },
      (error) => {
        console.error('Error searching brand:', error);
        // Handle error accordingly
      }
    );
  }   
}

selectSuggestion(suggestion: string) {
  this.SearchBrand = suggestion; // Set the input value to the selected suggestion
  this.filteredSuggestions = []; // Clear suggestions
}


  }


