import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { AuthService, CommunicationService } from '@core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    CommonModule,
    NgxSpinnerModule
  ],
})
export class SignupComponent implements OnInit {
  mgfRegistrationForm!: FormGroup;
  setPasswordFrom!: FormGroup;
  showPasswordForm = false;
  otpStep = false;
  hide = true;
  c_hide = true;
  otpFields: string[] = ['', '', '', '', '', ''];
  email: any = '';
  allIdentity: any;

  countryCode = [
    // { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    // { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    // { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];
  invitedBy: any[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private http: HttpClient, private router: Router, private spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email') || '';
    this.initializeForm();
    this.initializePasswordForm();
    this.getallIdentity()
    if (this.email) {
      this.authService.get(`invitations/${this.email}`).subscribe((res: any) => {
        this.mgfRegistrationForm.patchValue(res);
        // this.mgfRegistrationForm.get('role')?.disable();
        // this.mgfRegistrationForm.get('email')?.disable();
        this.invitedBy = res.invitedBy;
      }, (err: any) => {
        this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
      });

    }
  }

  getallIdentity() {
    this.authService.get('entitytype').subscribe((data: any) => {
      if (data) {
        this.allIdentity = data.results;
      }

    }, error => {

    })

  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: [''],
      role: ['', Validators.required],
      code: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: [this.email, [Validators.required, Validators.email]],
      otp: [''], // For email OTP
      mobileOtp: [''], // For mobile OTP
      refByEmail: [''],
    });
  }

  initializePasswordForm() {
    this.setPasswordFrom = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')  // Apply the custom validator here
    });
  }

  onSubmit() {
    const data = this.mgfRegistrationForm.value;
    data.refByEmail = this.invitedBy ? this.invitedBy[0] : '';

    if (this.otpStep) {
      // Verify both email OTP and mobile OTP
      this.verifyEmailOtp(data.email, data.otp);
      this.verifyMobileOtp(data.mobileNumber, data.mobileOtp);
    } else {
      if (this.mgfRegistrationForm.valid) {
        delete data.otp;
        delete data.mobileOtp; // Remove otp fields from the registration data
        data.mobileNumber = String(data.mobileNumber);
        this.spinner.show();

        // Call register API
        this.authService.post('auth/register', data).subscribe((res: any) => {
          // Send both email OTP and mobile OTP
          this.sendEmailOtp(data.email, data.fullName);
          this.sendMobileOtp(data.mobileNumber);

          this.otpStep = true;
          this.mgfRegistrationForm.controls['otp'].setValidators([Validators.required, Validators.minLength(6)]);
          this.mgfRegistrationForm.controls['mobileOtp'].setValidators([Validators.required, Validators.minLength(6)]);
          this.mgfRegistrationForm.controls['otp'].updateValueAndValidity();
          this.mgfRegistrationForm.controls['mobileOtp'].updateValueAndValidity();
          this.spinner.hide();
        }, (err: any) => {
          this.spinner.hide();
          this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
        });
      }
    }
  }

  sendMobileOtp(mobileNumber: string) {
    const otpUrl = `https://2factor.in/API/V1/d5e40971-765b-11ef-8b17-0200cd936042/SMS/+91${mobileNumber}/AUTOGEN/OTP1`;
    this.http.get(otpUrl).subscribe((res: any) => {
      console.log('Mobile OTP sent successfully');
    }, (err: any) => {
      console.log('Error sending mobile OTP:', err);
      this.communicationService.showNotification('snackbar-danger', 'Failed to send mobile OTP', 'bottom', 'center');
    });
  }

  sendEmailOtp(email: string, fullName: string) {
    this.authService.post(`auth/send-verification-email?email=${email}&fullName=${fullName}`, {}).subscribe((res: any) => {
      console.log('Verification email sent successfully');
    }, (err: any) => {
      this.spinner.hide();
      this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    });
  }
  

  passwordSubmit() {
    if (this.setPasswordFrom.valid) {
      console.log('Password Form Submitted:', this.setPasswordFrom.value);
      const data = this.setPasswordFrom.value;
      delete data.confirmPassword
      this.http.patch(`https://backend.fashiontradershub.com/v1/users/update-pass?email=${this.mgfRegistrationForm.value.email}`, data).subscribe((res: any) => {
        this.router.navigate([`/authentication/signin`]);
        this.changeUserStatus(this.email);
      }, (err: any) => {
        this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
      });
    }
  }

  onOtpChange(index: number, event: any) {
    const value = event.target.value;
    if (value.length === 1 && index < 5) {
      (document.getElementById(`otp${index + 2}`) as HTMLElement).focus();
    }
    this.otpFields[index] = value;
    this.mgfRegistrationForm.controls['otp'].setValue(this.otpFields.join(''));
  }

  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (matchingControl?.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }
      if (control?.value !== matchingControl?.value) {
        matchingControl?.setErrors({ mustMatch: true });
      } else {
        matchingControl?.setErrors(null);
      }

      return null;
    };
  }

  onMobileOtpChange(index: number, event: any): void {
    const value = event.target.value;
    const input = event.target as HTMLInputElement;
    const nextInput = document.getElementById(`mobileOtp${index + 2}`) as HTMLInputElement;
    if (input.value.length === 1 && nextInput) {
      nextInput.focus(); // Move to the next input field
    }
    this.otpFields[index] = value;
    this.mgfRegistrationForm.controls['mobileOtp'].setValue(this.otpFields.join(''));
  }
  

  verifyMobileOtp(mobileNumber: string, mobileOtp: string) {
    const verifyUrl = `https://2factor.in/API/V1/d5e40971-765b-11ef-8b17-0200cd936042/SMS/VERIFY3/+91${mobileNumber}/${mobileOtp}`;
    this.http.get(verifyUrl).subscribe((res: any) => {
      console.log('Mobile OTP verified successfully:', res);
      this.showPasswordForm = true;
    }, (err: any) => {
      console.log('Error verifying mobile OTP:', err);
      this.showPasswordForm = false;
      this.communicationService.showNotification('snackbar-danger', 'Mobile OTP verification failed', 'bottom', 'center');
    });
  }

  verifyEmailOtp(email: string, otp: string) {
    this.authService.post(`auth/verify-email?email=${email}&otp=${otp}`, {}).subscribe((res: any) => {
      console.log('Email OTP verified successfully:', res);
      this.showPasswordForm = true;
    }, (err: any) => {
      this.showPasswordForm = false;
      this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    });
  }
  

  changeUserStatus(user: any) {
    this.authService.patchWithEmail(`invitations/${user}`, { status: 'accepted' }).subscribe((res) => {
      this.communicationService.showNotification('snackbar-success', 'User status updated successfully', 'bottom', 'center');
    });
  }
  gotoHome() {
    window.open('https://fashiontradershub.com/', '_self');
  }
}
