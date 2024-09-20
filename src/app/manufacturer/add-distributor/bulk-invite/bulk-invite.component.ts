import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-bulk-invite',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './bulk-invite.component.html',
  styleUrls: ['./bulk-invite.component.scss']
})
export class BulkInviteSingleComponent {
  inviteForm!: FormGroup;
  isSubmitted: boolean = false;
  identityType: any;

  constructor(private fb: FormBuilder, private communicationService: CommunicationService, private authService: AuthService) { }

  ngOnInit(): void {
    this.getIdentityType();
    this.inviteForm = this.fb.group({
      invitations: this.fb.array([this.createDistributorFormGroup()])
    });
  }

  get invitations(): FormArray {
    return this.inviteForm.get('invitations') as FormArray;
  }

  createDistributorFormGroup(): FormGroup {
    return this.fb.group({
      role:['',Validators.required],
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      code: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  countryCode = [
    // { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    // { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    // { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];

  getIdentityType(){
    this.authService.get('entitytype').subscribe((res:any) =>{
      this.identityType = res.results;
    });
  }

  addDistributor(): void {
    this.invitations.push(this.createDistributorFormGroup());
  }

  removeDistributor(index: number): void {
    if (this.invitations.length > 1) {
      this.invitations.removeAt(index);
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.authService.post('invitations/array-upload', this.inviteForm.value).subscribe(
      invite => {
        this.communicationService.showNotification('snackbar-success', 'Invitation Sent Successfully', 'bottom', 'center');
        this.isSubmitted = false;
        this.resetForm();
      }, 
      error => {
        this.communicationService.showNotification('snackbar-error', error.error.message, 'bottom', 'center');
        this.isSubmitted = false;
        this.resetForm();
      }
    );
    console.log(this.inviteForm.value);
  }

  resetForm(): void {
    this.inviteForm.reset();
    this.inviteForm.setControl('invitations', this.fb.array([this.createDistributorFormGroup()]));
  }

  getErrorMessage(controlName: string, index: number): string {
    const control = this.invitations.at(index).get(controlName);
    if (control?.hasError('required')) {
      // return `${controlName.replace(/([A-Z])/g, ' $1')} is required.`;
      switch(controlName){
        case 'role': return 'Identity is required.';
        case 'fullName': return 'Full Name is required.';
        case 'companyName': return 'Company/Firm Name is required.';
        case 'code': return 'Country Code is required.';
        case'mobileNumber': return 'Mobile Number is required.';
        case 'email': return 'Email is required.';
        default: return '';
      }

    } else if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    } else if (control?.hasError('pattern') && controlName === 'mobileNumber') {
      return 'Please enter a valid 10-digit mobile number.';
    }
    return '';
  }
}
