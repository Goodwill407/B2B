import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-add-distributor',
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
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './add-distributor.component.html',
  styleUrl: './add-distributor.component.scss'
})
export class AddDistributorComponent {
  mgfRegistrationForm!: FormGroup;

  countryCode = [
    // { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    // { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    // { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];
  identityType: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.initializeForm();
    this.getIdentityType();
  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['',Validators.required],
      role: ['', Validators.required],
      code: ['+91', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.spinner.show();
    this.authService.post(`invitations`,this.mgfRegistrationForm.value).subscribe((res:any) =>{
      this.communicationService.showNotification('snackbar-success', 'Distributor invitation sent successfully', 'bottom', 'center');
      this.mgfRegistrationForm.reset();
      this.initializeForm();
      this.spinner.hide();
    },(err:any) =>{
      this.spinner.hide();
      this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    })
  }

  getIdentityType(){
    this.authService.get('entitytype').subscribe((res:any) =>{
      this.identityType = res.results;
    });
  }
  
}
