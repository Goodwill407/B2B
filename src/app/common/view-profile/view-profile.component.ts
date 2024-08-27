import { CommonModule, DatePipe, NgClass } from '@angular/common';
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
    CommonModule, NgClass,
    DatePipe
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss',
  providers: [DatePipe]
})
export class ViewProfileComponent {
  email: any;
  showFlag: boolean = false;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private authService: AuthService, private location: Location,private datePipe: DatePipe) {
    this.initializeValidation();
  }

  mgfRegistrationForm: any = FormGroup;

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem("currentUser")!);
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      const role = params['role'];
      if (this.email) {
        this.authService.get(`${role}/${this.email}`).subscribe((res: any) => {
          if (res) {
            res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
            res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
            this.mgfRegistrationForm.patchValue(res);
            this.mgfRegistrationForm.disable();
          } else {
          }
        },
          (error: any) => {
            if (error.error.message === "Wholesaler not found") {
              this.showFlag = true;
              setTimeout(() => {
                this.location.back();
              }, 3000);
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
      leagalStatusOfFirm: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      email2: ['', Validators.email],
      establishDate: ['', Validators.required],
      registerOnFTH: ['',],
      GSTIN: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)]],
      pan: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      socialMedia: this.fb.group({
        facebook: ['',],
        linkedIn: ['',],
        instagram: ['',],
        webSite: ['',]
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', [Validators.required, Validators.pattern(/^\d{9,18}$/)
        ]],
        accountType: ['', Validators.required],
        bankName: ['', Validators.required],
        IFSCcode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),]],
        country: ['', Validators.required],
        city: ['', Validators.required],
        branch: ['', Validators.required],
      })
    });
  }

  navigateFun() {
    this.location.back();
  }
}
