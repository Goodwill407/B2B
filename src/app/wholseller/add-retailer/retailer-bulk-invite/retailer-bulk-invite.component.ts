import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CommunicationService } from '@core';
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

  bottomAdImage: string = 'https://5.imimg.com/data5/QE/UV/YB/SELLER-56975382/i-will-create-10-sizes-html5-creative-banner-ads.jpg';

  constructor(private fb: FormBuilder, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      distributors: this.fb.array([this.createDistributorFormGroup()])
    });
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
      email: ['', [Validators.required, Validators.email]]
    });
  }

  countryCode = [
    { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];


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
    if (control?.hasError('required')) {
      return `${controlName.replace(/([A-Z])/g, ' $1')} is required.`;
    } else if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    return '';
  }
}
