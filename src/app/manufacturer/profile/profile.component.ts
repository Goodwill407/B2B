import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgClass
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  mgfRegistrationForm:any= FormGroup;
  submitted: boolean = false;
  userProfile: any

  constructor(private fb: FormBuilder, private authService: AuthService) {


  }



  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.InisilizeValidation()
    this.getProfileData()
  }

  InisilizeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      companyName: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      mobNumber2: [''],
      email: ['', [Validators.required, Validators.email]],
      email2: ['', Validators.email],
      GSTIN: ['', [Validators.required, Validators.pattern(/^[0-9]{15}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      socialMedia: this.fb.group({
        facebook: [''],
        linkedIn: [''],
        instagram: [''],
        webSite: ['']
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', Validators.required],
        accountType: ['', Validators.required],
        bankName: ['', Validators.required],
        IFSCcode: ['', Validators.required]
      })
    });
  }
  
  get f(){
    return this.mgfRegistrationForm.controls;
  }


  getProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        const allData = res
        this.mgfRegistrationForm.patchValue(allData)
      }
      else {
        this.mgfRegistrationForm.patchValue(this.userProfile)
      }
    })
  }



  onSubmit(Type: any): void {
    this.submitted = true;
    if (this.mgfRegistrationForm.invalid) {
      return;
    }
    else if (Type == 'Save') {
      this.SaveProfileData()
    }
    else if (Type == 'Update') {
      this.UpdateData()
    }

  }


  // save and update

  SaveProfileData() {
    this.authService.post('manufacturers', this.mgfRegistrationForm.value).subscribe((res: any) => {
      console.log(res)
    },
      error => {

      })


  }

  UpdateData() {
   this.authService.patchWithEmail(`manufacturers/${this.userProfile.email}`,this.mgfRegistrationForm.value)
   .subscribe(res=>{
  console.log(res)
   },
   error=>{

   })
  }

}

