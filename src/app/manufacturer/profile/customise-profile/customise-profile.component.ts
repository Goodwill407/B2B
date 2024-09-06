import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
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
    KycUploadComponent
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
  documents:any=['PAN Card']

  constructor(private fb: FormBuilder, public authService: AuthService, private communicationService: CommunicationService, private datePipe: DatePipe, private direction: DirectionService) { }

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
  }

  initializeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      logo: [false],  // No validation
      fileName: [false],
      file:[false],
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
      mobNumber:[false],
      mobNumber2:[false],
      email2:[false],
      GSTIN: [false],
      pan:[false],
      code: [false],
      establishDate: [false],
      turnover: [false],
      registerOnFTH: [false],
      socialMedia: this.fb.group({
        facebook: [false],
        linkedIn: [false],
        instagram:[false],
        webSite:[false]

      }),
      BankDetails: this.fb.group({
        accountNumber: [false],
        accountType: [false],
        bankName: [false],
        IFSCcode:[false],
        country: [false],
        city: [false],
        branch: [false]
      }),
      
    });
    }
  



  get f() {
    return this.mgfRegistrationForm.controls;
  }

  // get resisterd data
  // getRegisteredUserData() {
  //   this.authService.get(`users/registered-user/${this.userProfile.email}`).subscribe(res => {
  //     this.getResisterData = res;
  //     this.mgfRegistrationForm.patchValue({
  //       companyName: this.getResisterData.companyName,
  //       mobNumber: this.getResisterData.mobileNumber,
  //       email: this.getResisterData.email,
  //       fullName: this.getResisterData.fullName
  //     });

  //   },
  //     error => {
  //       this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center')
  //     }
  //   )
  // }

  // disbled some resistered feilds
  // disabledFields() {
  //   this.mgfRegistrationForm.get('fullName')?.disable();
  //   this.mgfRegistrationForm.get('email')?.disable();
  //   this.mgfRegistrationForm.get('mobNumber')?.disable();
  //   this.mgfRegistrationForm.get('companyName')?.disable();
  //   this.mgfRegistrationForm.get('registerOnFTH')?.disable();
  // }


  getSavedProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        // res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
        // res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
        this.allData = res;      
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
      this.updateData()
    }
  }

  saveProfileData() {
    // Retrieve the raw form data including all fields
    const formData = this.mgfRegistrationForm.getRawValue();
    formData.id=this.allData.id  
    // Call the API endpoint to patch the visibility settings for the manufacturer
    this.authService.patch(`manufacturers/visible-profile`,formData).subscribe(
      (res: any) => {
        if (res) {
          // Disable the form to prevent further edits
          this.mgfRegistrationForm.disable();
          
          // Set the flag to indicate editing mode is off
          this.isEditFlag = true;
          
          // Move to the next step in the process
          this.currentStep = 2;
        }
      },
      (error) => {
        // Handle error and show notification to the user
        this.communicationService.showNotification(
          'snackbar-danger',
          error.error?.message || 'An error occurred while saving the profile data.',
          'bottom',
          'center'
        );
      }
    );
  }
  
  updateData() {
    const formData = this.mgfRegistrationForm.getRawValue();
    this.authService.patchWithEmail(`manufacturers/${this.userProfile.email}`, formData)
      .subscribe(res => {
        if (res) {
          this.mgfRegistrationForm.disable();
          this.isUpdateBtn = false;
          this.currentStep = 2;
        }
      },
        error => {
          this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center')
        }
      )
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

  openImg(path:any){
    this.communicationService.openImg(path);
  }
}

