import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { KycUploadComponent } from 'app/common/kyc-upload/kyc-upload.component';
import { panMatchValidator } from 'app/common/pan-validation';

@Component({
  selector: 'app-customise-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgClass,
    MatSelectModule,
    KycUploadComponent,
    FormsModule
  ],
  templateUrl: './customise-profile.component.html',
  styleUrl: './customise-profile.component.scss',
  providers: [DatePipe]
})
export class CustomiseProfileComponent {
  mgfRegistrationForm: any = FormGroup;
  submitted: boolean = false;
  userProfile: any;
  getResisterData: any;
  currentStep: any = 1;

  // btn flag 
  isDataSaved = false;  // Flag to track if data is saved
  submitFlag = false;
  isUpdateBtn = false;
  isEditFlag = false
  allState: { name: string; cities: string[]; iso2: String }[] = [];
  cityList: any;
  allCountry: any;
  Allcities: any;
  allData: any;
  documents: any = ['PAN Card'];
  allBrands: any;
  allVisabilityData: any
  selectedCountryCode: any = 'India'

  constructor(private fb: FormBuilder, public authService: AuthService, private communicationService: CommunicationService, private route:Router, private direction: DirectionService) { }

  countries: any[] = [
    'India',
  ];

  countryCode = [
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
  ];

  legalStatusOptions: any[] = [
    "Individual - Proprietor",
    "Partnership",
    "LLP /LLC",
    "Private Limited",
    "Limited"
  ]

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.initializeValidation()
    this.getAllCountry()
    this.getSavedProfileData()
    // this.disabledFields();
    this.getAllState();
    this.getAllBrands();
  }

  initializeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      logo: [false],  // No validation
      fileName: [false],
      file: [false],
      profileImg: [false],
      leagalStatusOfFirm: [false],
      fullName: [false],
      companyName: [false],
      email: [false],
      address: [false],
      state: [false],
      introduction: [false],
      city: [false],
      country: [false],
      pinCode: [false],
      mobNumber: [false],
      mobNumber2: [false],
      email2: [false],
      GSTIN: [false],
      pan: [false],
      code: [false],
      establishDate: [false],
      turnover: [false],
      registerOnFTH: [false],
      delingInView: [false],
      socialMedia: this.fb.group({
        facebook: [false],
        linkedIn: [false],
        instagram: [false],
        webSite: [false]

      }),
      BankDetails: this.fb.group({
        accountNumber: [false],
        accountType: [false],
        bankName: [false],
        branch: [false],
        IFSCcode: [false],
        country: [false],
        city: [false],
      }),
    });
  }

  get f() {
    return this.mgfRegistrationForm.controls;
  }

  getSavedProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        this.allData = res;
        this.GetProfileVisabilityData()
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
        // this.getRegisteredUserData();
      }
    })
  }

  onSubmit(type: string): void {
    this.submitted = true;
    if (this.mgfRegistrationForm.invalid) {
      return;
    }
    else if (type === 'Save') {
      this.saveProfileData()
    }
    else if (type === 'Update') {
      // this.updateData()
    }
  }

  saveProfileData() {
    // Retrieve the raw form data including all fields
    const formData = this.mgfRegistrationForm.getRawValue();
    formData.id = this.allData.id
    
    this.authService.patch(`manufacturers/visibility`, formData).subscribe(
      (res: any) => {
        if (res) {
          this.communicationService.customSuccess('Customised Profile Data saved successfully!');
          this.GetProfileVisabilityData()
        }
      },
      (error) => {
        this.communicationService.customError(error.error?.message || 'An error occurred while saving the profile data.' );
      }
    );
  }

  GetProfileVisabilityData() {
    this.authService.get(`manufacturers/visible-profile/${this.allData.id}`).subscribe((res: any) => {
      if (res) {
        this.allVisabilityData = res.visibilitySettings
        this.mgfRegistrationForm.patchValue(this.allVisabilityData)
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
        // this.getRegisteredUserData();
      }
    })
  }

  getAllBrands() {
    this.authService.get(`brand/brandlist/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        this.allBrands = res; // Fetch and store brand data
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
      }
    });
  }
  
  updateBrand(id: string, data: any) {
    const value = data.target.checked; // Get the checkbox value
    this.authService.patch(`brand/updatevisibility`, { id: id, visibility: value }).subscribe((data: any) => {
      console.log(data); // Log the response for debugging
    }, error => {
      console.error('Error updating brand:', error); // Log error if any
    });
  }

  editUserData() {
    this.mgfRegistrationForm.enable();
    this.mgfRegistrationForm.get('registerOnFTH')?.disable();
    this.isUpdateBtn = true;
  }

  getAllState() {
    this.direction.getStates('https://api.countrystatecity.in/v1/countries/IN/states').subscribe(res => {
      this.allState = res;
    });
  }

  stateWiseCity(event: any, stateName: any = '', cityName: any = '') {
    const state = event === null ? stateName : event.target.value;
    this.direction.getCities(`https://api.countrystatecity.in/v1/countries/IN/states/${state}/cities`).subscribe((res: any) => {
      this.cityList = res;
      this.mgfRegistrationForm.get('city')?.setValue(cityName);
    });
  }

  getAllCountry() {
    this.direction.getAllCountry().subscribe((res: any) => {
      this.allCountry = res
    })
  }

  onCountryChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    const countryCode = target.value;
    this.direction.getCities(countryCode).subscribe(data => {
      this.Allcities = data;
    });
  }

  openImg(path: any) {
    this.communicationService.openImg(path);
  }

  navigateToProfile() {
    // Navigate to the target route with email as query parameter
    this.route.navigate(['/mnf/preview-profile'], { queryParams: { id: this.allData.id ,email:this.userProfile.email } });
  }
}


