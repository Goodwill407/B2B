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

  countryCode = [
    { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private http: HttpClient, private router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.initializeForm();
    this.initializePasswordForm();
  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: [''],
      role: ['', Validators.required],
      code: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      otp: ['']
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
    if (this.otpStep) {
      this.authService.post(`auth/verify-email?email=${data.email}&otp=${data.otp}`, {}).subscribe((res: any) => {
        console.log('Form submitted with OTP:', res);
        this.showPasswordForm = true;
      });
    } else {
      if (this.mgfRegistrationForm.valid) {
        delete data.otp;
        data.mobileNumber = String(data.mobileNumber);
        this.spinner.show();
        this.authService.post('auth/register', data).subscribe((res: any) => {
          this.authService.post(`auth/send-verification-email?email=${data.email}`, {}).subscribe((res: any) => {
            this.otpStep = true;
            this.mgfRegistrationForm.controls['otp'].setValidators([Validators.required, Validators.minLength(6)]);
            this.mgfRegistrationForm.controls['otp'].updateValueAndValidity();
            console.log('Verification email sent successfully');
            this.spinner.hide();
          }, (err: any) => {
            this.spinner.hide();
            this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
          });
        }, (err: any) => {
          this.spinner.hide();
          this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
        });
      }
    }
  }

  passwordSubmit() {
    if (this.setPasswordFrom.valid) {
      console.log('Password Form Submitted:', this.setPasswordFrom.value);
      const data = this.setPasswordFrom.value;
      delete data.confirmPassword
      this.http.patch(`http://165.22.211.140:3000/v1/users/update-pass?email=${this.mgfRegistrationForm.value.email}`, data).subscribe((res: any) => {
        this.router.navigate([`/authentication/signin`]);
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
}
