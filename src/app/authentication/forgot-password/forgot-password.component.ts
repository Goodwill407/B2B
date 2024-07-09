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
  ],
})
export class ForgotPasswordComponent implements OnInit {
  mobForm!: UntypedFormGroup;
  passwordForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  mobileVerified = false;
  hide = true;
  chide = true;

  otpField: string = '';
  otpSend: boolean = false;
  winRef: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    windowRef: WindowService, private authSer:AuthService
  ) {
    this.winRef = windowRef;
  }

  ngOnInit() {
    this.mobForm = this.formBuilder.group({
      username: ['', [Validators.required]],
    });

    this.passwordForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    }, {
      validator: this.MustMatch('newPassword', 'confirmPassword')
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.mobForm.controls; }
  get pf() { return this.passwordForm.controls; }

  onSubmitMobForm() {
    this.submitted = true;
    if (this.mobForm.invalid) {
      return;
    } else {
      // this.sendLoginOtp();
      this.GetOtp();
    }
  }

  onSubmitPasswordForm() {
    if (this.passwordForm.invalid) {
      return;
    }

    // Call backend to reset the password
    // Assuming backend call is successful
    this.router.navigate(['/dashboard/main']);
  }

  MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: UntypedFormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }
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
    if (!valid) {
      return { strongPassword: true };
    }
    return null;
  }

  // ======= OTP ======
  // sendLoginOtp() {
  //   const auth = getAuth();
  //   this.winRef.recaptchaVerifier = new RecaptchaVerifier(
  //     'recaptcha-container',
  //     {
  //       size: 'invisible',
  //     },
  //     auth
  //   );
  //   const appVerifier = this.winRef.recaptchaVerifier;

  //   const phoneNumber = `+1${this.mobForm.value.mobNumber}`; // Ensure proper phone number format
  //   signInWithPhoneNumber(auth, phoneNumber, appVerifier)
  //     .then((confirmationResult) => {
  //       this.otpSend = true;
  //       this.winRef.confirmationResult = confirmationResult;
  //       this.communicationService.showNotification('snackbar-success', 'OTP has been sent to your mobile number...!!!', 'bottom', 'center');
  //     })
  //     .catch((error) => {
  //       if (error.message == "INVALID_PHONE_NUMBER : Invalid format.") {
  //         this.communicationService.showNotification('snackbar-danger', 'Invalid Mobile No...!!!', 'bottom', 'center');
  //       } else if (error.message == "CAPTCHA_CHECK_FAILED : Hostname match not found") {
  //         this.communicationService.showNotification('snackbar-danger', 'Captcha check failed...!!!', 'bottom', 'center');
  //       }
  //     });
  // }

  GetOtp() {
    // const userId = this.loginForm.value.userId;
    this.authSer.post('auth/otp-send', this.mobForm.value).subscribe((data: any) => {
      if (data) {
        this.otpSend = true;
        this.mobileVerified = true;
        this.communicationService.showNotification('snackbar-success', 'OTP has been sent to your mobile number...!!!', 'bottom', 'center');
      }
    }, (error) => {
      // this.error = 'Invalid User Id'
      // this.toastr.error('', 'Email Username or Password!');
      this.communicationService.showNotification('snackbar-danger', 'Invalid User Id...!!!', 'bottom', 'center');
    });
  }

  verifyOtp() {
    this.winRef.confirmationResult
      .confirm(this.otpField)
      .then((result: any) => {
        // this.register();
      })
      .catch((error: any) => {
        this.communicationService.showNotification('snackbar-danger', 'Wrong OTP...!!!', 'bottom', 'center');
      });
  }
}
