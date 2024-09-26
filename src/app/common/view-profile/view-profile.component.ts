import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule, NgClass,
    DatePipe,
    FormsModule
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
  providers: [DatePipe]
})
export class ViewProfileComponent {
  email: any;
  showFlag: boolean = false;
  user:any;
  wholesalerCategory:any;
  userEmail:any
  SelectedCategory: any=null
  allWholselerData:any
  showFlagForDiscount:boolean=false;
  filteredDiscounts:any
  addDiscountBtnHide=true;
  isDropdownDisabled:boolean=false;
  retailerDiscount:any


  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private location: Location,private datePipe: DatePipe
   , private communicationService:CommunicationService
  ) {
    this.initializeValidation();
    this.userEmail = this.authService.currentUserValue;
  }

  mgfRegistrationForm: any = FormGroup;

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem("currentUser")!);
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      const role = params['role'];
      this.user= params['role'];
      this.showFlagForDiscount=params['showFlag'];
      if (this.email) {
        this.authService.get(`${role}/${this.email}`).subscribe((res: any) => {
          if (res) {
            this.allWholselerData=res
            res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
            res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
            this.mgfRegistrationForm.patchValue(res);
            this.mgfRegistrationForm.disable();
            this.getAllWholesalerCategoryOrRetailerCategory()
            if(this.user=='wholesaler'){
              this.getWholesalerDiscountData() 
            }
            else if(this.user=='retailer'){
              this.getRetailerDiscountData()
            }
                     
          } else {
          }
        },
          (error: any) => {
            if (error.error.message === "Wholesaler not found") {
              this.showFlag = true;
              setTimeout(() => {
                this.location.back();
              }, 3000);
            }
          })
      }
    });
  } 
  

  initializeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      address: ['', Validators.required],
      country: ['India', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      mobNumber2: [''],
      leagalStatusOfFirm: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      email2: ['', Validators.email],
      establishDate: ['', Validators.required],
      registerOnFTH: ['',],
      GSTIN: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      socialMedia: this.fb.group({
        facebook: ['',],
        linkedIn: ['',],
        instagram: ['',],
        webSite: ['',]
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)
        ]],
        accountType: ['', Validators.required],
        bankName: ['', Validators.required],
        IFSCcode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),]],
        country: ['', Validators.required],
        city: ['', Validators.required],
        branch: ['', Validators.required],
      })
    });
  }

  navigateFun() {
    this.location.back();
  } 

  getAllWholesalerCategoryOrRetailerCategory() {
    const email=this.userEmail.email
    this.authService.get(`${this.user}-category?categoryBy=${this.authService.currentUserValue.email}`).subscribe((res: any) => {
      this.wholesalerCategory = res.results;     
    });
  }
 

  addDiscountForWholesaler() {
  const objBody = {
    email: this.allWholselerData.email,
    discountGivenBy: this.userEmail.email, // Use the correct property of the selected object
    category: this.SelectedCategory.category, // Assuming this.SelectedCategory has category
    productDiscount: this.SelectedCategory.productDiscount, // Replace with actual property names
    shippingDiscount: this.SelectedCategory.shippingDiscount, // Replace with actual property names
  };

  // Initialize URL variable
  let url = '';

  if (this.user === 'wholesaler') {
    url = `wholesaler/assigndiscount`;
  } else if (this.user === 'retailer') {
    url = `wholesaler/retailer/assigndiscount`; // Adjust URL according to your backend API
  }

  // Ensure URL is set before making the API call
  if (url) {
    this.authService.post(url, objBody).subscribe(
      (res: any) => {
        if (res) {
          this.isDropdownDisabled = true; // Disable the dropdown if a category is selected
          this.addDiscountBtnHide = false; // Show the "Add Discount" button
          this.communicationService.showNotification(
            'snackbar-success',
            'Added Discount successfully',
            'bottom',
            'center'
          );
        }
      },
      (error) => {
        console.error('Error:', error); // Handle error response
      }
    );
  } else {
    console.error('Invalid user type for assigning discount'); // Error for undefined user type
  }
}


  getWholesalerDiscountData() {
    this.authService.get(`wholesaler/getdiscount/${this.allWholselerData.id}/${this.userEmail.email}`).subscribe(
      (res: any) => {
        if (res) {
          this.filteredDiscounts = res;

          // Find the matching category from the wholesalerCategory array
          this.SelectedCategory = this.wholesalerCategory.find(
            (category: any) => category.category === res.category
          );

          // Set the dropdown's disabled state based on your condition
          if (this.SelectedCategory) {
            if (this.SelectedCategory.category) {
              this.isDropdownDisabled = true; // Disable the dropdown if category is found
              this.addDiscountBtnHide = false; // Show the button
            }
          }
        }
      },
      (error) => {
        console.error("Error fetching discount data", error);
      }
    );
  } 

  getRetailerDiscountData() {
    this.authService.get(`wholesaler/retailer/getdiscount/${this.allWholselerData.id}/${this.userEmail.email}`).subscribe(
      (res: any) => {
        if (res) {
          this.filteredDiscounts = res;

          // Find the matching category from the wholesalerCategory array
          this.SelectedCategory = this.wholesalerCategory.find(
            (category: any) => category.category === res.category
          );

          // Set the dropdown's disabled state based on your condition
          if (this.SelectedCategory) {
            if (this.SelectedCategory.category) {
              this.isDropdownDisabled = true; // Disable the dropdown if category is found
              this.addDiscountBtnHide = false; // Show the button
            }
          }
        }
      },
      (error) => {
        console.error("Error fetching discount data", error);
      }
    );
  } 
  
  editDiscountCategory(){
    this.addDiscountBtnHide=true;   
    this.isDropdownDisabled = false;     
  }
}
