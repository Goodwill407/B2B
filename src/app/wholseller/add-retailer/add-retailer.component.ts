import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-retailer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,NgFor,
    RouterModule,
    FormsModule,   
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './add-retailer.component.html',
  styleUrl: './add-retailer.component.scss'
})
export class AddRetailerComponent {

  mgfRegistrationForm!: FormGroup;

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
      companyName: ['',],
      code: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      emailAddress: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    
  }

  
}
