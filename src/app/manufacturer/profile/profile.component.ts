import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, CommunicationService, DirectionService } from '@core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgClass,
    JsonPipe,
    DatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [DatePipe]
})
export class ProfileComponent {

  mgfRegistrationForm: any = FormGroup;
  submitted: boolean = false;
  userProfile: any
  getResisterData: any

  // btn flag
  isDataSaved = false;  // Flag to track if data is saved
  submitFlag = false;
  isUpdateBtn = false;
  isEditFlag = false
  allState: { name: string; cities: string[]; iso2: String }[] = [];
  cityList: any;
  allCountry:any
  Allcities:any

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService,private datePipe: DatePipe, private direction: DirectionService) { }

  countries: any[] = [
    'United States',
    'United Kingdom',
    'Australia',
    'India',
  ]

  legalStatusOptions:any[]=[
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
    this.getAllState();
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
      leagalStatusOfFirm: ['',[Validators.required]],
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
        accountNumber: ['', [ Validators.required, Validators.pattern(/^\d{9,18}$/) 
        ]],
        accountType: ['', Validators.required],
        bankName: ['', Validators.required],
        IFSCcode: ['',[Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),]],
        country: ['', Validators.required],
        city: ['', Validators.required],
        branch: ['', Validators.required],
      })
    });
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
      this.communicationService.showNotification('snackbar-danger',error.error.message,'bottom','center')
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
    }


  getSavedProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
        res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
        const allData = res;
        this.mgfRegistrationForm.patchValue(allData);
        this.stateWiseCity(null, allData.state, allData.city);
        this.mgfRegistrationForm.disable();
        this.isDataSaved = true;
        this.isEditFlag = true
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
        this.getRegisteredUserData();
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
    const formData = this.mgfRegistrationForm.getRawValue();
    this.authService.post('manufacturers', formData).subscribe((res: any) => {
      if (res) {
        this.mgfRegistrationForm.disable();
        this.isEditFlag = true;
      }
    },
      error => {
        this.communicationService.showNotification('snackbar-danger',error.error.message,'bottom','center')
      }
    )
  }

  updateData() {
    const formData = this.mgfRegistrationForm.getRawValue();
    this.authService.patchWithEmail(`manufacturers/${this.userProfile.email}`, formData)
      .subscribe(res => {
        if (res) {
          this.mgfRegistrationForm.disable();
          this.isUpdateBtn = false;
        }
      },
      error => {
        this.communicationService.showNotification('snackbar-danger',error.error.message,'bottom','center')
      }
      )
  }

  editUserData() {
    this.mgfRegistrationForm.enable();
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

  getAllCountry(){
    this.direction.getAllCountry().subscribe((res:any)=>{
      this.allCountry=res
    })
  }
  onCountryChange(event: any): void {
    const target = event.target as HTMLSelectElement;
    const countryCode = target.value;
    this.direction.getCities(countryCode).subscribe(data => {
      this.Allcities = data;
    });
  }
}
