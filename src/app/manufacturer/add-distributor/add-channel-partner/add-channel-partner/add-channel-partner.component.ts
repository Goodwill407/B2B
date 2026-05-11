import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-add-channel-partner',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './add-channel-partner.component.html',
  styleUrl: './add-channel-partner.component.scss'
})
export class AddChannelPartnerComponent {

  cpForm!: FormGroup;
  user: any;
  isSubmitting = false;
  profileImgFile: File | null = null;
  documentFile: File | null = null;
  profileImgPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
  }

  initForm() {
    this.cpForm = this.fb.group({
      fullName: ['', Validators.required],
      companyName: [''],
      email: ['', [Validators.required, Validators.email]],
      mobNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      mobNumber2: ['',[Validators.pattern(/^\d{10}$/)]],
      email2: ['', Validators.email],
      address: [''],
      country: ['India'],
      state: [''],
      city: [''],
      pinCode: ['', Validators.pattern(/^\d{6}$/)],
      GSTIN: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)],
      pan: ['', Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      establishDate: [''],
      turnover: [''],
      leagalStatusOfFirm: [''],
      socialMedia: this.fb.group({
        facebook: [''],
        instagram: [''],
        linkedIn: [''],
        webSite: ['']
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', Validators.pattern(/^\d{9,18}$/)],
        accountType: [''],
        bankName: [''],
        IFSCcode: ['', Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
        country: [''],
        city: [''],
        branch: [''],
        swiftCode: ['']
      })
    });
  }

  onProfileImgChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImgFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.profileImgPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  onDocumentChange(event: any) {
    const file = event.target.files[0];
    if (file) this.documentFile = file;
  }

  isInvalid(field: string): boolean {
    const control = this.cpForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
  if (this.cpForm.invalid) {
    this.cpForm.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  const formValue = this.cpForm.value;

  const formData = new FormData();

  // ✅ Helper — only append if value is not null/undefined/empty
  const append = (key: string, value: any) => {
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value);
    }
  };

  // Required fields — always append
  formData.append('fullName', formValue.fullName);
  formData.append('email', formValue.email);
  formData.append('mobNumber', formValue.mobNumber);
  formData.append('password', 'AB123456');
  formData.append('registrationType', 'byManufacturer');

  // Optional fields — only append if filled
  append('companyName', formValue.companyName);
  append('mobNumber2', formValue.mobNumber2);
  append('email2', formValue.email2);
  append('address', formValue.address);
  append('country', formValue.country);
  append('state', formValue.state);
  append('city', formValue.city);
  append('pinCode', formValue.pinCode);
  append('GSTIN', formValue.GSTIN);
  append('pan', formValue.pan);
  append('establishDate', formValue.establishDate);
  append('turnover', formValue.turnover);
  append('leagalStatusOfFirm', formValue.leagalStatusOfFirm);

  // ✅ Nested objects — JSON.stringify (backend parses them)
  // Only send if at least one field is filled
  const socialMedia = formValue.socialMedia;
  const hasSocial = socialMedia.facebook || socialMedia.instagram || socialMedia.linkedIn || socialMedia.webSite;
  if (hasSocial) {
    formData.append('socialMedia', JSON.stringify(socialMedia));
  }

  const bank = formValue.BankDetails;
  const hasBank = bank.accountNumber || bank.bankName || bank.IFSCcode;
  if (hasBank) {
    formData.append('BankDetails', JSON.stringify(bank));
  }

  // ✅ Files — only if selected
  if (this.profileImgFile) formData.append('profileImg', this.profileImgFile);
  if (this.documentFile) formData.append('file', this.documentFile);

  this.authService.post('channel-partner', formData).subscribe({
    next: (res: any) => {
      this.isSubmitting = false;
      this.communicationService.showNotification(
        'snackbar-success',
        'Channel Partner added successfully',
        'bottom',
        'center'
      );
      this.router.navigate(['/mnf/list-ch-partner']);
    },
    error: (err: any) => {
      this.isSubmitting = false;
      this.communicationService.showNotification(
        'snackbar-danger',
        err?.error?.message || 'Something went wrong',
        'bottom',
        'center'
      );
    }
  });
}

  navigateBack() {
    this.router.navigate(['/mnf/list-ch-partner']);
  }
}