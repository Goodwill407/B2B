import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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

  countryCode = [
    { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      designation: ['', Validators.required],
      code: ['+91', Validators.required],
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
