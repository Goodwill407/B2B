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
  getResisterData:any

  // btn flag
  isDataSaved = false;  // Flag to track if data is saved
  submitFlag = false;
  isUpdateBtn=false;
  isEditFlag=false

  constructor(private fb: FormBuilder, private authService: AuthService) {

  }



  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);    
    this.InisilizeValidation()     
    this.getSavedProfileData()   
    this.disbledFeilds()
  }

  InisilizeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
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
      // merchantImg: ['', ],
      // companyLogo: ['', ],
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

  // get resisterd data
  getResistereduserData(){
    this.authService.get(`users/registered-user/${this.userProfile.email}`).subscribe(res=>{
      this.getResisterData=res
      this.mgfRegistrationForm.patchValue({
        companyName: this.getResisterData.companyName,
        mobNumber:this.getResisterData.mobileNumber,
        email:this.getResisterData.email,
        fullName:this.getResisterData.fullName
      });

    },
    error=>{

    }
  )
  }

  // disbled some resistered feilds
  disbledFeilds(){
    this.mgfRegistrationForm.get('fullName')?.disable();
    this.mgfRegistrationForm.get('email')?.disable();
    this.mgfRegistrationForm.get('mobNumber')?.disable();
    this.mgfRegistrationForm.get('companyName')?.disable();
}


  getSavedProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        const allData = res
        this.mgfRegistrationForm.patchValue(allData)
        this.mgfRegistrationForm.disable()
        this.isDataSaved=true
        this.isEditFlag=true;
      }
      else {
      
      }
    }
  ,error=>{
    if(error.error.message == "Manufaturer not found"){
    this.getResistereduserData()
  }
  })
  }



  onSubmit(Type: any): void {
    this.mgfRegistrationForm
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
    const formData=this.mgfRegistrationForm.getRawValue();
    
    this.authService.post('manufacturers',formData ).subscribe((res: any) => {
      console.log(res)
      if(res){
        this.mgfRegistrationForm.disable()   
        this.isEditFlag=true;     
      }
    },
      error => {

      })


  }

  UpdateData() {
    const formData=this.mgfRegistrationForm.getRawValue();
   this.authService.patchWithEmail(`manufacturers/${this.userProfile.email}`,formData)
   .subscribe(res=>{
     if(res){
      this.mgfRegistrationForm.disable()
      this.isUpdateBtn=false; 
     }
   },
   error=>{

   })
  }

  editUserData(){
    this.mgfRegistrationForm.enable()
    this.isUpdateBtn=true 
    // this.isEditFlag=false
  }

}

