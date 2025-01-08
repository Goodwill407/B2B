import { Component, OnInit ,NgZone,ChangeDetectorRef  } from '@angular/core';
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
  emailTimeLeft: number = 180; // Email OTP timer (3 minutes)
  mobileTimeLeft: number = 180; // Mobile OTP timer (3 minutes)
  emailInterval: any; // Interval for email timer
  mobileInterval: any; // Interval for mobile timer
  timeLeft: number = 180; // Unified timer for 3 minutes
interval: any; // Interval for the timer

  isIndiaSelected: boolean = false; // Track whether India is selected

  countryCode: any[] = [];
  invitedBy: any[] = [];

  constructor(private fb: FormBuilder,private cdr: ChangeDetectorRef, private authService: AuthService, private communicationService: CommunicationService, private http: HttpClient, private router: Router, private spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.email = this.route.snapshot.paramMap.get('email') || '';
    this.initializeForm();
    this.initializePasswordForm();
    this.getallIdentity()
    this.getAllCountry()
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
  startEmailTimer() {
    this.emailTimeLeft = 180; // Reset timer to 3 minutes
    clearInterval(this.emailInterval); // Clear any existing interval
    this.emailInterval = setInterval(() => {
      if (this.emailTimeLeft > 0) {
        this.emailTimeLeft--;
      } else {
        clearInterval(this.emailInterval); // Stop timer when it reaches 0
      }
    }, 1000); // Decrease every second
  }
  
  startMobileTimer() {
    this.mobileTimeLeft = 180; // Reset timer to 3 minutes
    clearInterval(this.mobileInterval); // Clear any existing interval
    this.mobileInterval = setInterval(() => {
      if (this.mobileTimeLeft > 0) {
        this.mobileTimeLeft--;
      } else {
        clearInterval(this.mobileInterval); // Stop timer when it reaches 0
      }
    }, 1000); // Decrease every second
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
      contryCode: ['+91'],
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
      // OTP verification logic
      if (this.isIndiaSelected) {
        if (!this.mgfRegistrationForm.controls['otp'].valid || !this.mgfRegistrationForm.controls['mobileOtp'].valid) {
          this.communicationService.showNotification(
            'snackbar-danger',
            'Please enter valid Email and Mobile OTPs',
            'bottom',
            'center'
          );
          return;
        }
  
        // Verify both Email and Mobile OTPs
        Promise.all([
          this.verifyEmailOtp(data.email, data.otp),
          this.verifyMobileOtp(data.mobileNumber, data.mobileOtp),
        ])
          .then(([emailVerified, mobileVerified]) => {
            if (emailVerified && mobileVerified) {
              console.log('Both OTPs verified successfully');
              this.showPasswordForm = true; // Allow password form to be shown
            }
          })
          .catch(() => {
            console.log('OTP verification failed');
            this.showPasswordForm = false; // Prevent showing the password form
          });
  
      } else {
        // If not India, only verify Email OTP
        if (!this.mgfRegistrationForm.controls['otp'].valid) {
          this.communicationService.showNotification(
            'snackbar-danger',
            'Please enter a valid Email OTP',
            'bottom',
            'center'
          );
          return;
        }
  
        this.verifyEmailOtp(data.email, data.otp)
          .then((emailVerified) => {
            if (emailVerified) {
              console.log('Email OTP verified successfully');
              this.showPasswordForm = true; // Allow password form to be shown
            }
          })
          .catch(() => {
            console.log('Email OTP verification failed');
            this.showPasswordForm = false; // Prevent showing the password form
          });
      }
    } else {
      // First step - Registration
      if (this.mgfRegistrationForm.valid) {
        delete data.otp;
        delete data.mobileOtp;
        data.mobileNumber = String(data.mobileNumber);
  
        this.spinner.show();
  
        // Call registration API
        this.authService.post('auth/register', data).subscribe(
          (res: any) => {
            this.sendEmailOtp(data.email, data.fullName);
  
            if (this.isIndiaSelected) {
              this.sendMobileOtp(data.mobileNumber);
            }
  
            this.otpStep = true; // Activate OTP step
            this.startTimer(); // Start the unified timer
            this.spinner.hide();
          },
          (err: any) => {
            this.spinner.hide();
            this.communicationService.showNotification(
              'snackbar-danger',
              err.error.message,
              'bottom',
              'center'
            );
          }
        );
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
  

  verifyMobileOtp(mobileNumber: string, mobileOtp: string): Promise<boolean> {
    const verifyUrl = `https://2factor.in/API/V1/d5e40971-765b-11ef-8b17-0200cd936042/SMS/VERIFY3/+91${mobileNumber}/${mobileOtp}`;
    return new Promise((resolve, reject) => {
      this.http.get(verifyUrl).subscribe(
        (res: any) => {
          console.log('Mobile OTP verified successfully:', res);
          resolve(true); // OTP verification succeeded
        },
        (err: any) => {
          console.log('Error verifying mobile OTP:', err);
          reject(false); // OTP verification failed
        }
      );
    });
  }
  
  

  verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.post(`auth/verify-email?email=${email}&otp=${otp}`, {}).subscribe(
        (res: any) => {
          console.log('Email OTP verified successfully:', res);
          this.communicationService.showNotification(
            'snackbar-success',
            'Email OTP verified successfully',
            'bottom',
            'center'
          );
          resolve(true); // OTP verified successfully
        },
        (err: any) => {
          console.log('Error verifying email OTP:', err);
          this.communicationService.showNotification(
            'snackbar-danger',
            'Email OTP verification failed',
            'bottom',
            'center'
          );
          reject(false); // OTP verification failed
        }
      );
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

  getAllCountry() {
    this.authService.get(`/countrycode?sortBy=dial_code`).subscribe((res: any) => {
      this.countryCode = res.results;
      const india = this.countryCode.find(country => country.dial_code === '91');
      if (india) {
        this.mgfRegistrationForm.controls['contryCode'].setValue('+91');
        this.isIndiaSelected = true; // Default behavior for India
      }
    });
  }
  
  
  onCountryChange(event: any) {
    const selectedDialCode = event.value; // Get the selected country code
    this.isIndiaSelected = selectedDialCode === '+91';
  
    // Update form controls based on selection
    if (this.isIndiaSelected) {
      // Apply validators for India
      this.mgfRegistrationForm.controls['mobileOtp'].setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      // Remove validators for other countries
      this.mgfRegistrationForm.controls['mobileOtp'].clearValidators();
      this.mgfRegistrationForm.controls['mobileOtp'].setValue(''); // Clear value if not needed
    }
    this.mgfRegistrationForm.controls['mobileOtp'].updateValueAndValidity();
  }
  
  isButtonDisabled(): boolean {
    if (this.isIndiaSelected) {
      // For India, both OTPs are required
      return this.mgfRegistrationForm.invalid || 
             !this.mgfRegistrationForm.controls['mobileOtp'].value || 
             !this.mgfRegistrationForm.controls['otp'].value;
    } else {
      // For other countries, only the email OTP is required
      return this.mgfRegistrationForm.invalid || 
             !this.mgfRegistrationForm.controls['otp'].value;
    }
  }
  
  resendEmailOtp() {
    // Resend email OTP
    this.sendEmailOtp(this.mgfRegistrationForm.value.email, this.mgfRegistrationForm.value.fullName);
    this.startEmailTimer(); // Restart email timer
    this.communicationService.showNotification('snackbar-success', 'Email OTP resent successfully', 'bottom', 'center');
  }
  
  resendMobileOtp() {
    // Resend mobile OTP
    this.sendMobileOtp(this.mgfRegistrationForm.value.mobileNumber);
    this.startMobileTimer(); // Restart mobile timer
    this.communicationService.showNotification('snackbar-success', 'Mobile OTP resent successfully', 'bottom', 'center');
  }
  startTimer() {
    this.timeLeft = 180; // Reset timer to 3 minutes
    clearInterval(this.interval); // Clear any existing interval
  
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.cdr.detectChanges(); // Force Angular to detect changes
      } else {
        clearInterval(this.interval); // Stop timer when it reaches 0
      }
    }, 1000); // Decrease every second
  }

  resendOtps() {
    this.sendEmailOtp(this.mgfRegistrationForm.value.email, this.mgfRegistrationForm.value.fullName);

    if (this.isIndiaSelected) {
      this.sendMobileOtp(this.mgfRegistrationForm.value.mobileNumber);
    }

    this.startTimer(); // Restart timer
  }
    
}
