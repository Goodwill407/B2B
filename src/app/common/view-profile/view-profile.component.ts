import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule, NgClass
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  email: any;
  showFlag: boolean = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private location: Location) {
    this.initializeValidation();
  }

  mgfRegistrationForm: any = FormGroup;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (this.email) {
        this.authService.get(`wholesaler/${this.email}`).subscribe((res: any) => {
          if (res) {
            this.mgfRegistrationForm.patchValue(res);
            this.mgfRegistrationForm.disable();
          } else {
          }
        },
          (error: any) => {
            if (error.error.message === "Wholesaler not found") {
              this.showFlag = true;
              setTimeout(()=>{
                this.location.back();
              },3000);
            }
          })
      }
    });
  }

  initializeValidation() {
    this.mgfRegistrationForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: ['', Validators.required],
      address: ['', Validators.required],
      country: ['India', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      mobNumber2: [''],
      email: ['', [Validators.required, Validators.email]],
      email2: ['', Validators.email],
      GSTIN: ['', [Validators.required, Validators.pattern(/^[0-9]{15}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      socialMedia: this.fb.group({
        facebook: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+$/)]],
        linkedIn: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?linkedin\.com\/.+$/)]],
        instagram: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?instagram\.com\/.+$/)]],
        webSite: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?(www\.)?[^ "]+$/)]]
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', Validators.required],
        accountType: ['', Validators.required],
        bankName: ['', Validators.required],
        IFSCcode: ['', Validators.required]
      })
    });
  }

  navigateFun() {
    this.location.back();
  }
}
