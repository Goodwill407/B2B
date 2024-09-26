import { NgIf, NgFor, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, RouterLink } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

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
    NgxSpinnerModule,
    CommonModule,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './add-retailer.component.html',
  styleUrl: './add-retailer.component.scss'
})
export class AddRetailerComponent {
  mgfRegistrationForm!: FormGroup;

  countryCode = [
    // { countryName: 'United States', flag: 'assets/images/flags/us.jpg', code: '+1' },
    { countryName: 'India', flag: 'assets/images/flags/ind.png', code: '+91' },
    // { countryName: 'United Kingdom', flag: 'assets/images/flags/uk.png', code: '+44' },
    // { countryName: 'Australia', flag: 'assets/images/flags/aus.png', code: '+61' },
  ];

  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      role: ['retailer', Validators.required],
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

  
}
