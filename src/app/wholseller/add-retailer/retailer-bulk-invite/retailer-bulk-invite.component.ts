import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';

@Component({
  selector: 'app-retailer-bulk-invite',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor, NgIf,
    RouterModule,
    MatInputModule,
    MatSelectModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './retailer-bulk-invite.component.html',
  styleUrl: './retailer-bulk-invite.component.scss'
})
export class RetailerBulkInviteComponent {
  inviteForm!: FormGroup;
  isSubmitted: boolean = false;

   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];

  altcountryCode: any;

  constructor(private fb: FormBuilder, private communicationService: CommunicationService, private auth: AuthService) { }

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      distributors: this.fb.array([this.createDistributorFormGroup()])
    });
    this.getAllCountryCode()
  }

  get distributors(): FormArray {
    return this.inviteForm.get('distributors') as FormArray;
  }

  createDistributorFormGroup(): FormGroup {
    return this.fb.group({
      distributorName: ['', Validators.required],
      companyName: ['',Validators.required],
      code: ['+91', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],//A-Z removed
    });
  }

  countryCode:any


  addDistributor(): void {
    this.distributors.push(this.createDistributorFormGroup());
  }

  removeDistributor(index: number): void {
    if (this.distributors.length > 1) {
      this.distributors.removeAt(index);
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    else {
      this.communicationService.showNotification('snackbar-success', 'Invitation Sent Successfully', 'bottom', 'center');
      alert(this.inviteForm.value.toString());
      this.isSubmitted = false;
      this.inviteForm.reset();
    }
    console.log(this.inviteForm.value);
  }

  getErrorMessage(controlName: string, index: number): string {
    const control = this.distributors.at(index).get(controlName);
    let errorMessage = '';
    if (control?.hasError('required')) {
      errorMessage =  `${controlName.replace(/([A-Z])/g, ' $1')} is required.`;
    } else if (control?.hasError('email')) {
      errorMessage =  'Please enter a valid email address.';
    }
    return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1).toLowerCase();
  }

  getAllCountryCode() {
    this.auth.get('/countrycode?sortBy=dial_code').subscribe((res: any) => {
      // Store the list of dial codes in the altcountryCode array
      this.altcountryCode = res.results.map((country: any) => country.dial_code);
      
      // Optionally, set a default value (e.g., '+91') for altCode if needed
      if (this.countryCode.includes('91')) {
        this.inviteForm.controls['altCode'].setValue('+91');
      }
    });
  }
}
