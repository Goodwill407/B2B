import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core';
import { MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition, MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
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
    CommonModule
  ],
})
export class SignupComponent implements OnInit {
 
  mgfRegistrationForm!: FormGroup;
  otpStep: boolean = false;
  otpFields: string[] = ['', '', '', '', '', ''];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      designation: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
      otp: ['']
    });
  }

  onSubmit() {
    if (this.otpStep) {
      // Handle final submission with OTP
      console.log('Form submitted with OTP:', this.mgfRegistrationForm.value);
    } else {
      if (this.mgfRegistrationForm.valid) {
        this.otpStep = true;
        console.log('Data:', this.mgfRegistrationForm.value);
        this.mgfRegistrationForm.controls['otp'].setValidators([Validators.required, Validators.minLength(6)]);
        this.mgfRegistrationForm.controls['otp'].updateValueAndValidity();
      }
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
}
