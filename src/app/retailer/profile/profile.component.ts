import { CommonModule, NgClass, JsonPipe, DatePipe } from '@angular/common';
import { panMatchValidator } from '../../common/pan-validation';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { KycUploadComponent } from 'app/common/kyc-upload/kyc-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgClass,
    JsonPipe,MatSelectModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent,
    DatePipe,
    KycUploadComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [DatePipe]
})
export class ProfileComponent {

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
  altcountryCode: any;

  constructor(private fb: FormBuilder, public authService: AuthService, private communicationService: CommunicationService, private datePipe: DatePipe, private direction: DirectionService,private dialog: MatDialog) { }

  countries: any[] = [ ];
  state: any;

  countryCode: string = '+91';

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
    this.disabledFields();
    this.getAllCountryCode()
    
  }

  initializeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      address: ['', Validators.required],
      introduction: ['', [Validators.required, Validators.maxLength(4000)]],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      code: [{ value: this.countryCode, disabled: true }, Validators.required],
      altCode: [''],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      mobNumber2: [''],
      leagalStatusOfFirm: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      email2: ['', Validators.email],
      establishDate: ['', Validators.required],
      registerOnFTH: [{ value: '', disabled: true }],
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
    }, { validators: panMatchValidator('GSTIN', 'pan') });
  }



  get f() {
    return this.mgfRegistrationForm.controls;
  }

  // get resisterd data
  getRegisteredUserData() {
    this.authService.get(`users/registered-user/${this.userProfile.email}`).subscribe(res => {
      this.getResisterData = res;
     
      this.mgfRegistrationForm.patchValue({
        companyName: this.getResisterData.companyName,
        mobNumber: this.getResisterData.mobileNumber,
        email: this.getResisterData.email,
        fullName: this.getResisterData.fullName
        
      });

    },
      error => {
        this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center')
      }
    )
  }

  // disbled some resistered feilds
  disabledFields() {
    this.mgfRegistrationForm.get('fullName')?.disable();
    this.mgfRegistrationForm.get('email')?.disable();
    this.mgfRegistrationForm.get('mobNumber')?.disable();
    this.mgfRegistrationForm.get('companyName')?.disable();
    this.mgfRegistrationForm.get('registerOnFTH')?.disable();
    this.mgfRegistrationForm.get('code')?.disable();
    this.mgfRegistrationForm.get('code')?.disable();
  }
  
  getSavedProfileData() {
    this.authService.get(`retailer/${this.userProfile.email}`).subscribe(
      async (res: any) => {
        if (res) {
          //console.log(res);
  
          // Format dates
          res.establishDate = res.establishDate
            ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd')
            : null;
          res.registerOnFTH = res.registerOnFTH
            ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd')
            : null;
  
          // Default country code to "+91" if not available
          this.countryCode = res.countryCode || '+91';
  
          // Assign other response data to the form
          this.allData = res;
          this.mgfRegistrationForm.patchValue(this.allData);
  
          // Patch the country code
          this.mgfRegistrationForm.patchValue({ code: this.countryCode });
  
          // Fetch states and patch the state value once loaded
          await this.getAllState({ country_name: res.country });
          this.mgfRegistrationForm.patchValue({ state: res.state });
  
          this.stateWiseCity(null, this.allData.state, this.allData.city);
  
          this.mgfRegistrationForm.disable();
          this.currentStep = 1;
          this.isDataSaved = true;
          this.isEditFlag = true;
        } else {
          // Handle manufacturer not found error
        }
      },
      (error) => {
        if (error.error.message === 'Manufacturer not found') {
          this.getRegisteredUserData();
        }
      }
    );
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
    const formData = this.mgfRegistrationForm.getRawValue();
    this.authService.post('retailer', formData).subscribe((res: any) => {
      if (res) {
        this.mgfRegistrationForm.disable();
        this.isEditFlag = true;
        this.currentStep = 2;
      }
    },
      error => {
        this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center')
      }
    )
  }

  updateData() {
    const formData = this.mgfRegistrationForm.getRawValue();
    this.authService.patchWithEmail(`retailer/${this.userProfile.email}`, formData)
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
    this.mgfRegistrationForm.get('email')?.disable();
    this.mgfRegistrationForm.get('code')?.disable();
    this.mgfRegistrationForm.get('mobNumber')?.disable();
    this.isUpdateBtn = true;
  }

 

  stateWiseCity(event: any, stateName: any = '', cityName: any = '') {
    const state = event === null ? stateName : event.target.value;
    this.direction.getCities(`https://api.countrystatecity.in/v1/countries/IN/states/${state}/cities`).subscribe((res: any) => {
      this.cityList = res;
      this.mgfRegistrationForm.get('city')?.setValue(cityName);
    });
  }
  getAllCountry() {
    this.authService.get('newcountry').subscribe(
      (res: any) => {
        if (res && res.results) {
          // Extract only the country names
          this.countries = res.results.map((country: any) => country.name);  
        } else {  
        }
      },
    );
  }
  
  getAllState(country: { country_name: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.post('/state/searchby/country', country).subscribe(
        (states: any) => {
          if (states && states.data && states.data.results) {
            // Assuming states.data.results contains the state list
            this.allState = states.data.results.map((state: any) => ({
              name: state.name,
            }));
  
            // Resolve the promise after processing
            resolve();
          } else {
            // Reject the promise if the response structure isn't as expected
            reject(new Error('Invalid response structure'));
          }
        },
        (error) => {
          // Log the error and reject the promise
          console.error('Error fetching states:', error);
          reject(error);
        }
      );
    });
  }
  
  onCountryChange(event: any): void {
    const selectedCountry = event.target.value; // Get selected country
    if (selectedCountry) {
      const body = { country_name: selectedCountry }; // Format the request body
      this.getAllState(body); // Fetch states
    } else {
      this.allState = []; // Clear states if no country selected
    }
  }
  

  openImg(path:any,size:number){
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: size+'px',
      data: {path:path,width:size}  // Pass the current product data
    });
  }

  //alternate c code 
  getAllCountryCode() {
    this.authService.get('/countrycode?sortBy=dial_code').subscribe((res: any) => {
      // Store the list of dial codes in the altcountryCode array
      this.altcountryCode = res.results.map((country: any) => country.dial_code);
      
      // Optionally, set a default value (e.g., '+91') for altCode if needed
      if (this.altcountryCode.includes('91')) {
        this.mgfRegistrationForm.controls['altCode'].setValue('+91');
      }
    });
  }
}