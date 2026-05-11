import { CommonModule, NgClass, NgIf, TitleCasePipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-cp-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    TitleCasePipe,
    DatePipe
  ],
  templateUrl: './cp-profile.component.html',
  styleUrl: './cp-profile.component.scss'
})
export class CpProfileComponent implements OnInit {

  cpForm!: FormGroup;
  profileData: any = null;
  isEditing = false;
  isSubmitting = false;
  profileImgFile: File | null = null;
  documentFile: File | null = null;
  profileImgPreview: string | null = null;

  // Snapshot to restore on cancel
  private formSnapshot: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  initForm(): void {
    this.cpForm = this.fb.group({
      fullName:         ['', Validators.required],
      companyName:      [''],
      email:            [{ value: '', disabled: true }],   // always locked
      mobNumber:        [{ value: '', disabled: true }],   // always locked
      mobNumber2:       ['', Validators.pattern(/^\d{10}$/)],
      email2:           ['', Validators.email],
      address:          [''],
      country:          ['India'],
      state:            [''],
      city:             [''],
      pinCode:          ['', Validators.pattern(/^\d{6}$/)],
      GSTIN:            ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)],
      pan:              ['', Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      establishDate:    [''],
      turnover:         [''],
      leagalStatusOfFirm: [''],
      socialMedia: this.fb.group({
        facebook:  [''],
        instagram: [''],
        linkedIn:  [''],
        webSite:   ['']
      }),
      BankDetails: this.fb.group({
        accountNumber: ['', Validators.pattern(/^\d{9,18}$/)],
        accountType:   [''],
        bankName:      [''],
        IFSCcode:      ['', Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
        country:       [''],
        city:          [''],
        branch:        [''],
        swiftCode:     ['']
      })
    });

    // Start in view mode — all editable fields disabled
    this.setFormEditable(false);
  }

  loadProfile(): void {
    const user = this.authService.currentUserValue;
    const email = user?.email;

    this.authService.get(`channel-partner/email/${email}`).subscribe({
      next: (res: any) => {
        this.profileData = res;
        this.patchForm(res);
      },
      error: () => {
        this.communicationService.showNotification(
          'snackbar-danger', 'Failed to load profile.', 'bottom', 'center'
        );
      }
    });
  }

  patchForm(data: any): void {
    this.cpForm.patchValue({
      fullName:           data.fullName || '',
      companyName:        data.companyName || '',
      email:              data.email || '',
      mobNumber:          data.mobNumber || '',
      mobNumber2:         data.mobNumber2 || '',
      email2:             data.email2 || '',
      address:            data.address || '',
      country:            data.country || 'India',
      state:              data.state || '',
      city:               data.city || '',
      pinCode:            data.pinCode || '',
      GSTIN:              data.GSTIN || '',
      pan:                data.pan || '',
      establishDate:      data.establishDate ? data.establishDate.split('T')[0] : '',
      turnover:           data.turnover || '',
      leagalStatusOfFirm: data.leagalStatusOfFirm || '',
      socialMedia: {
        facebook:  data.socialMedia?.facebook  || '',
        instagram: data.socialMedia?.instagram || '',
        linkedIn:  data.socialMedia?.linkedIn  || '',
        webSite:   data.socialMedia?.webSite   || ''
      },
      BankDetails: {
        accountNumber: data.BankDetails?.accountNumber || '',
        accountType:   data.BankDetails?.accountType   || '',
        bankName:      data.BankDetails?.bankName       || '',
        IFSCcode:      data.BankDetails?.IFSCcode       || '',
        country:       data.BankDetails?.country        || '',
        city:          data.BankDetails?.city           || '',
        branch:        data.BankDetails?.branch         || '',
        swiftCode:     data.BankDetails?.swiftCode      || ''
      }
    });
    if (data.profileImg) this.profileImgPreview = data.profileImg;
  }

  toggleEdit(): void {
    this.formSnapshot = this.cpForm.getRawValue(); // save snapshot
    this.isEditing = true;
    this.setFormEditable(true);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.setFormEditable(false);
    if (this.formSnapshot) {
      this.cpForm.patchValue(this.formSnapshot);
    }
    this.profileImgFile = null;
    this.documentFile = null;
    if (this.profileData?.profileImg) {
      this.profileImgPreview = this.profileData.profileImg;
    }
  }

  setFormEditable(enable: boolean): void {
    const LOCKED = ['email', 'mobNumber'];
    Object.keys(this.cpForm.controls).forEach(key => {
      if (LOCKED.includes(key)) return; // always keep locked
      const ctrl = this.cpForm.get(key);
      if (ctrl instanceof FormGroup) {
        Object.keys(ctrl.controls).forEach(subKey => {
          enable ? ctrl.get(subKey)?.enable() : ctrl.get(subKey)?.disable();
        });
      } else {
        enable ? ctrl?.enable() : ctrl?.disable();
      }
    });
  }

  onProfileImgChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileImgFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.profileImgPreview = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  onDocumentChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.documentFile = file;
  }

  isInvalid(field: string): boolean {
    const control = this.cpForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending:  'badge-warning',
      active:   'badge-success',
      inactive: 'badge-danger',
      approved: 'badge-success'
    };
    return map[status?.toLowerCase()] || 'badge-neutral';
  }

  onSubmit(): void {
    if (this.cpForm.invalid) {
      this.cpForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.cpForm.getRawValue(); // getRawValue includes disabled fields

    const formData = new FormData();
    const append = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        formData.append(key, value);
      }
    };

    // Core fields
    append('fullName',           formValue.fullName);
    append('companyName',        formValue.companyName);
    append('mobNumber2',         formValue.mobNumber2);
    append('email2',             formValue.email2);
    append('address',            formValue.address);
    append('country',            formValue.country);
    append('state',              formValue.state);
    append('city',               formValue.city);
    append('pinCode',            formValue.pinCode);
    append('GSTIN',              formValue.GSTIN);
    append('pan',                formValue.pan);
    append('establishDate',      formValue.establishDate);
    append('turnover',           formValue.turnover);
    append('leagalStatusOfFirm', formValue.leagalStatusOfFirm);

    // Nested: social media
    const sm = formValue.socialMedia;
    if (sm.facebook || sm.instagram || sm.linkedIn || sm.webSite) {
      formData.append('socialMedia', JSON.stringify(sm));
    }

    // Nested: bank details
    const bank = formValue.BankDetails;
    if (bank.accountNumber || bank.bankName || bank.IFSCcode) {
      formData.append('BankDetails', JSON.stringify(bank));
    }

    // Files
    if (this.profileImgFile) formData.append('profileImg', this.profileImgFile);
    if (this.documentFile)   formData.append('file', this.documentFile);

    this.authService.patchpimage(`channel-partner/${this.profileData?.id}`, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isEditing = false;
        this.setFormEditable(false);
        this.loadProfile(); // refresh data
        this.communicationService.showNotification(
          'snackbar-success', 'Profile updated successfully!', 'bottom', 'center'
        );
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.communicationService.showNotification(
          'snackbar-danger',
          err?.error?.message || 'Something went wrong',
          'bottom', 'center'
        );
      }
    });
  }
}