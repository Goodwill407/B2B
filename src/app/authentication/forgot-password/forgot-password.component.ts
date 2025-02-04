import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { WindowService } from 'window.service';
import { RecaptchaVerifier, getAuth, signInWithPhoneNumber } from 'firebase/auth';
import { AuthService, CommunicationService } from '@core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    FormsModule, NgIf,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgxSpinnerModule
  ],
})
export class ForgotPasswordComponent implements OnInit {
  mobForm!: UntypedFormGroup;
  passwordForm!: UntypedFormGroup;
  otpForm!: UntypedFormGroup;
  otpFields: string[] = ['', '', '', '', '', ''];
  mobileVerified = false;
  otpSend = false; // Track if OTP has been sent
  userDetails: any = {}; // Will hold user data from the server
  showPasswordForm = false;
  hide = true;
  c_hide = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private authSer: AuthService,
    private http: HttpClient,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    let email: string = '';
    this.route.queryParamMap.subscribe(params => {
      email = params.get('email') || '';
      this.getUser(email);
    });

    // Mobile/email selection form
    this.mobForm = this.formBuilder.group({
      username: [null, [Validators.required]], 
    });

    // OTP form
    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });

    // Password reset form
    this.passwordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  getUser(email: string) {
    this.authSer.get('users/registered-user/' + email).subscribe((res: any) => {
      this.userDetails = res;
    });
  }

  onSubmitMobForm() {
    if (this.mobForm.invalid) {
      return;
    }
    this.GetOtp();
  }

  onSubmitPasswordForm() {
    if (this.passwordForm.invalid) {
      return;
    }
    const data = this.passwordForm.value;
      delete data.confirmPassword
      data.email = this.userDetails.email
      this.authSer.post(`auth/reset-password`, data).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Password is Updated Successfully...!', 'bottom', 'center');
        
        this.router.navigate([`/authentication/signin`]);
      }, (err: any) => {
        this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
      }); 
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  strongPasswordValidator(control: any) {
    const value = control.value;
    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const valid = hasNumber && hasUpper && hasLower;
    return valid ? null : { strongPassword: true };
  }

  GetOtp() {
    const username = this.mobForm.get('username')?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    this.spinner.show();
    if (emailRegex.test(username)) {
      this.sendEmailOtp(username, this.userDetails?.fullName);
    } else {
      this.sendMobileOtp(username);
    }
  }
  
  sendMobileOtp(mobileNumber: string) {
    const otpUrl = `https://2factor.in/API/V1/d5e40971-765b-11ef-8b17-0200cd936042/SMS/+91${mobileNumber}/AUTOGEN/OTP1`;
    this.http.get(otpUrl).subscribe((res: any) => {
      this.otpSend = true;
      this.mobileVerified = true;
      this.communicationService.showNotification('snackbar-success', 'Mobile OTP sent successfully!', 'bottom', 'center');
      this.spinner.hide();
    }, (err: any) => {
      this.spinner.hide();
      this.communicationService.showNotification('snackbar-danger', 'Failed to send mobile OTP', 'bottom', 'center');
    });
  }
  
  sendEmailOtp(email: string, fullName: string) {
    this.authSer.post(`auth/forgot-password?email=${email}&fullName=${fullName}`, {}).subscribe((res: any) => {
      this.otpSend = true;
      this.mobileVerified = true;
      this.communicationService.showNotification('snackbar-success', 'Email verification sent successfully!', 'bottom', 'center');
      this.spinner.hide();
    }, (err: any) => {
      this.spinner.hide();
      this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    });
  }

  verifyOtpForm() {
    const username = this.mobForm.get('username')?.value;
    const otp = this.otpForm.get('otp')?.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegx = /^[0-9]{10}$/;
    this.spinner.show();
    if (emailRegex.test(username)) {
      this.verifyEmailOtp(username, otp);
    } 
    if (mobileRegx.test(username)) {
      this.verifyMobileOtp(username, otp);
     // // console.log('Verified mobile ' + username);
    }
    else {
      this.spinner.hide();
      // this.communicationService.showNotification('snackbar-danger', 'Invalid email or mobile number.', 'bottom', 'center');
    }
  }
  
  verifyMobileOtp(mobileNumber: string, otp: string) {
    // Format the mobile number with the country code +91
    const formattedMobileNumber = `+91${mobileNumber}`;
  
    // Construct the API URL with mobile number and OTP as path parameters
    const verifyUrl = `https://2factor.in/API/V1/d5e40971-765b-11ef-8b17-0200cd936042/SMS/VERIFY3/${formattedMobileNumber}/${otp}`;
  
    this.spinner.show();
  
    // Send a GET request with the constructed URL
    this.http.get(verifyUrl).subscribe(
      (res: any) => {
        // Handle the success response
        if (res.Status === 'Success') {
          this.showPasswordForm = true;  // OTP verified, show the password form
          this.spinner.hide();
        } else {
          // If OTP verification failed, show error message
          this.spinner.hide();
          this.communicationService.showNotification('snackbar-danger', 'Mobile OTP verification failed. Please try again.', 'bottom', 'center');
        }
      },
      (err: any) => {
        // Handle the error response (e.g., network failure)
        this.spinner.hide();
        this.communicationService.showNotification('snackbar-danger', 'An error occurred during mobile OTP verification. Please try again later.', 'bottom', 'center');
      }
    );
  }
  
  
  
  verifyEmailOtp(email: string, otp: string) {
  this.authSer.post(`auth/verify-email?email=${email}&otp=${otp}`, {}).subscribe((res: any) => {
    if (res.message == "OTP verified successfully") {  // Check if response is successful based on your API structure
      this.showPasswordForm = true;
    } else {
      this.communicationService.showNotification('snackbar-danger', res.message, 'bottom', 'center');
    }
    this.spinner.hide();
  }, (err: any) => {
    this.spinner.hide();
    this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
  });
}

  maskEmail(email: string): string {
    const prefix = email.split('@')[0]; 
    const domain = email.split('@')[1]; 
    const visiblePrefix = prefix.substring(0, 2);  
    const visibleSuffix = prefix.substring(prefix.length - 2); 
    const maskedMiddle = '*'.repeat(prefix.length - 4);
    return visiblePrefix + maskedMiddle + visibleSuffix + '@' + domain;
  }
  
  maskMobNo(mobNo: string): string {
    return mobNo.slice(0, 2) + '****' + mobNo.slice(-2);
  }

  onOtpChange(index: number, event: any) {
    const value = event.target.value;
    if (value.length === 1 && index < 5) {
      (document.getElementById(`otp${index + 2}`) as HTMLElement).focus();
    }
    this.otpFields[index] = value;
    this.otpForm.controls['otp'].setValue(this.otpFields.join(''));
  }
}