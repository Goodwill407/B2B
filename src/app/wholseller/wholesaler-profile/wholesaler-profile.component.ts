import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-wholesaler-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './wholesaler-profile.component.html',
  styleUrl: './wholesaler-profile.component.scss'
})
export class WholesalerProfileComponent {

  mgfRegistrationForm!: FormGroup;
  constructor(private fb: FormBuilder) {
    this.mgfRegistrationForm = fb.group({
      comName: ['', Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      mobNumberAlt: ['', Validators.required],
      emailAlt: ['', Validators.required],
      gstin: ['', Validators.required],
      pan: ['', Validators.required],
      fb: ['', Validators.required],
      linkedin: ['', Validators.required],
      insta: ['', Validators.required],
      web: ['', Validators.required],
      acNo: ['', Validators.required],
      acType: ['', Validators.required],
      bankName: ['', Validators.required],
      ifsc: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]]
    });
  }
}

