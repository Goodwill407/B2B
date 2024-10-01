import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';

@Component({
  selector: 'app-request-to-wholesaler',
  standalone: true,
  imports: [ RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
    NgFor,
    FormsModule,
    NgIf,
    NgClass
  ],
  templateUrl: './request-to-wholesaler.component.html',
  styleUrl: './request-to-wholesaler.component.scss'
})
export class RequestToWholesalerComponent {
  page=1
  limit=10;
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
  countries=['India']
  userProfile:any;
  WholsellerData:any
  filteredSuggestions: string[] = [];


  brandData:any[]=[];
  cdnPath:any
  SearchBrand:any;
  dataType:any;
  productTypeWise:any[]=[];
  allCountry: any;
  allState: { name: string; cities: string[]; iso2: String }[] = [];
  cityList: any;
// ==========new data
 
  wholesalerData: any[] = []; 

  RetailserData:any

   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';

  constructor(private authService:AuthService,private direction: DirectionService, private route:Router, private communicationService:CommunicationService, private elementRef: ElementRef ){
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(){
    this.cdnPath = this.authService.cdnPath;
   this.getRetailerProfileData()
    this.getAllBrands()
    this.getProductType()
    this.getProductType()
    this.getAllState()    
    this.getWholesalerProfileData()
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    // Clear suggestions if click is outside the input box or suggestions list
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (clickedInside) {
      this.filteredSuggestions = [];
    }
  }

 searchByWholselers(): void {
    if (this.SearchBrand) {         
      const object={
        brand :this.SearchBrand
      }
      this.authService.post(`wholesaler-products/filter-wholesaler-products-brands?page=${this.page}&limit=${this.limit}`,object).subscribe(
        response => {    
          this.productTypeWise=[]
          this.wholesalerData=response.results.map((item: any) => item.wholesaler);
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

  GetProductTypeWiseWholesaler() {
    let url = `wholesaler-products/multiplefilters/filter-wholesalers`;
  
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
    if (this.filters.country) {
      body.country = this.filters.country;
    }
    if (this.filters.city) {
      body.city = this.filters.city;
    }
    if (this.filters.state) {
      body.state = this.filters.state;
    }
  
    // Call the API with the dynamically constructed body
    this.authService.post(url, body).subscribe(
      (res: any) => {
        this.wholesalerData=[]      
       this.productTypeWise = res.results.map((item: any) => item.wholesaler);
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

  navigateToProfile(id: any,email:any) {
    // Navigate to the target route with email as query parameter
    this.route.navigate(['/retailer/view-wholesaler-details'], { queryParams: { id: id ,email:email } });
  }

  sendRequestToWholesaler(wholesaler:any){  
    const requestBody={
      fullName : wholesaler.fullName ,
      companyName: wholesaler.companyName,
      email:  wholesaler.email,
      code:  wholesaler.code,
      mobileNumber:  wholesaler.mobNumber,
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
      state:  wholesaler.state,
      city:  wholesaler.city,
      country:  wholesaler.country
    }
  this.authService.post('request',requestBody).subscribe(
    response => {        
      this.brandData=response       
      this.communicationService.showNotification('snackbar-success', 'Request added successfully','bottom','center');
    },
    error => {    
      this.communicationService.showNotification(
        'snackbar-error',error.error.message , 'bottom','center');
    }
  );
        
}

getWholesalerProfileData() {
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

// for clear data after change tab
onTabChange(tabName: string) {
  if (tabName === 'brand') {
    this.productTypeWise = [];  // Clear product array when switching to brand tab
  } else if (tabName === 'product') {
    this.wholesalerData = [];  // Clear brand array when switching to product tab
  }
}


onSearchBrandChange() {
  if (this.SearchBrand) {
    const object = {
      brandName: this.SearchBrand
    };

    this.authService.post('wholesaler-products/filter-wholesaler-products-brands', object).subscribe(
      (response) => { 
       this.filteredSuggestions = response.results.map((item: any) => item.product.brand); // Extract 'brandName' from each item
        // Handle the response as needed, e.g., update the UI
      },
      (error) => {
        console.error('Error searching brand:', error);
        // Handle error accordingly
      }
    );
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

selectSuggestion(suggestion: string) {
  this.SearchBrand = suggestion; // Set the input value to the selecSearchBrandted suggestion
  this.filteredSuggestions = []; // Clear suggestions
}

// for address filter
stateWiseCity() {
  const state = this.filters.state;
  this.direction.getCities(`https://api.countrystatecity.in/v1/countries/IN/states/${state}/cities`).subscribe((res: any) => {
    this.cityList = res;   
  });
}

getAllCountry() {
  this.direction.getAllCountry().subscribe((res: any) => {
    this.allCountry = res
  })
}

getAllState() {
  this.direction.getStates('https://api.countrystatecity.in/v1/countries/IN/states').subscribe(res => {
    this.allState = res;
  });
}



}
