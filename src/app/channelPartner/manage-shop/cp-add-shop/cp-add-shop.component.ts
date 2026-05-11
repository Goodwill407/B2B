import { CommonModule, Location, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cp-add-shop',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './cp-add-shop.component.html',
  styleUrl: './cp-add-shop.component.scss'
})
export class CpAddShopComponent implements OnInit {

  addShopForm!: FormGroup;
  isSubmitting  = false;
  isEditMode    = false;
  shopId        = '';
  Math          = Math;

  selectedFile:       File | null = null;
  selectedProfileImg: File | null = null;
  profilePreview:     string | null = null;
  existingProfileImg: string | null = null;
  existingFile:       string | null = null;
  existingFileName:   string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'edit' && params['id']) {
        this.isEditMode = true;
        this.shopId     = params['id'];
        this.loadShopData();
      }
    });
  }

  buildForm() {
  this.addShopForm = this.fb.group({
    fullName:      ['', [Validators.required]],
    email:         ['', [Validators.required, Validators.email]],
    password:      ['Shop1234', [Validators.required, Validators.minLength(8)]],
    mobileNumber:  ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],  // ✅ 10 digits, starts 6-9
    shopName:      [''],
    companyName:   [''],
    address:       [''],
    city:          [''],
    state:         [''],
    country:       [''],
    pinCode:       [''],
    GSTIN:         ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],  // ✅ GST format
    pan:           ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],  // ✅ PAN format
    introduction:  [''],
    turnover:      [''],
    establishDate: [''],
  });
}

toUpperCase(field: string) {
  const ctrl = this.addShopForm.get(field);
  if (ctrl?.value) ctrl.setValue(ctrl.value.toUpperCase(), { emitEvent: false });
}

  loadShopData() {
    this.spinner.show();
    this.authService.get(`channel-partner-customers/${this.shopId}`).subscribe({
      next: (res: any) => {
        // Pre-fill form
        this.addShopForm.patchValue({
          fullName:      res.fullName      || '',
          email:         res.email         || '',
          mobileNumber:  res.mobileNumber  || '',
          shopName:      res.shopName      || '',
          companyName:   res.companyName   || '',
          address:       res.address       || '',
          city:          res.city          || '',
          state:         res.state         || '',
          country:       res.country       || '',
          pinCode:       res.pinCode       || '',
          GSTIN:         res.GSTIN         || '',
          pan:           res.pan           || '',
          introduction:  res.introduction  || '',
          turnover:      res.turnover      || '',
          establishDate: res.establishDate
            ? new Date(res.establishDate).toISOString().split('T')[0]
            : '',
        });

        // In edit mode — password not required
        this.addShopForm.get('password')?.clearValidators();
        this.addShopForm.get('password')?.updateValueAndValidity();

        // Store existing file/img references
        this.existingProfileImg = res.profileImg || null;
        this.existingFile       = res.file       || null;
        this.existingFileName   = res.fileName   || null;
        this.profilePreview     = res.profileImg || null;

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this.communicationService.showNotification(
          'snackbar-danger', 'Failed to load shopkeeper data.', 'bottom', 'center'
        );
      }
    });
  }

  onProfileImgChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfileImg = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.profilePreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onSubmit() {
    if (this.addShopForm.invalid) {
      this.addShopForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formVal = this.addShopForm.value;

    // Build multipart/form-data
    const formData = new FormData();
    Object.keys(formVal).forEach(key => {
      // Skip password on edit if blank
      if (key === 'password' && this.isEditMode && !formVal[key]) return;
      if (formVal[key] !== null && formVal[key] !== '') {
        formData.append(key, formVal[key]);
      }
    });

    if (this.selectedProfileImg) formData.append('profileImg', this.selectedProfileImg);
    if (this.selectedFile)       formData.append('file',       this.selectedFile);

    const request$ = this.isEditMode
      ? this.authService.patchpimage(`channel-partner-customers/${this.shopId}`, formData)
      : this.authService.post('channel-partner-customers/create-shopkeeper', formData);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.communicationService.showNotification(
          'snackbar-success',
          this.isEditMode ? 'Shopkeeper updated successfully!' : 'Shopkeeper created successfully!',
          'bottom',
          'center'
        );
        this.location.back();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err?.error?.message || 'Something went wrong';
        this.communicationService.showNotification('snackbar-danger', msg, 'bottom', 'center');
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.addShopForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  goBack() {
    this.location.back();
  }
}