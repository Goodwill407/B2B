import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-add-update-vendor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    DividerModule
  ],
  templateUrl: './add-update-vendor.component.html',
  styleUrl: './add-update-vendor.component.scss'
})
export class AddUpdateVendorComponent implements OnInit {
  vendorForm!: FormGroup;
  isEditMode: boolean = false;
  vendorId: string | null = null;
  loading: boolean = false;
  manufacturerEmail: string = '';

  materialCategoryOptions = [
    { label: 'Fabric', value: 'Fabric' },
    { label: 'Lining', value: 'Lining' },
    { label: 'Interlining', value: 'Interlining' },
    { label: 'Buttons', value: 'Buttons' },
    { label: 'Zippers', value: 'Zippers' },
    { label: 'Thread', value: 'Thread' },
    { label: 'Labels', value: 'Labels' },
    { label: 'Packaging', value: 'Packaging' },
    { label: 'Accessories', value: 'Accessories' },
    { label: 'Trim', value: 'Trim' }
  ];

  paymentTermOptions = [
    { label: 'Advance', value: 'Advance' },
    { label: '7 days credit', value: '7 days credit' },
    { label: '15 days credit', value: '15 days credit' },
    { label: '30 days credit', value: '30 days credit' },
    { label: '45 days credit', value: '45 days credit' },
    { label: '60 days credit', value: '60 days credit' },
    { label: 'COD', value: 'COD' }
  ];

  accountTypes = [
    { label: 'Savings', value: 'Savings' },
    { label: 'Current', value: 'Current' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    this.manufacturerEmail = currentUser?.email || '';

    this.vendorId = this.route.snapshot.paramMap.get('id');
    
    if (this.vendorId) {
      this.isEditMode = true;
      this.loadVendorData(this.vendorId);
    }
  }

  initializeForm(): void {
    this.vendorForm = this.fb.group({
      // Basic Information
      vendorName: ['', [Validators.required, Validators.minLength(2)]],
      code: [''],
      contactPersonName: [''],
      vendorEmail: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      altContactNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
      
      // Tax Information
      gstNumber: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],
      panNumber: ['', Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)],
      
      // Address
      address: this.fb.group({
        line1: [''],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
      }),
      
      // Business Details
      materialCategories: [[], Validators.required],
      paymentTerms: ['', Validators.required],
      
      // Bank Details
      bankDetails: this.fb.group({
        accountHolderName: [''],
        accountNumber: ['', Validators.pattern(/^[0-9]{9,18}$/)],
        accountType: [''],
        bankName: [''],
        branchName: [''],
        ifscCode: ['', Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
        swiftCode: [''],
        upiId: [''],
        bankAddress: ['']
      }),
      
      notes: [''],
      isActive: [true]
    });
  }

  loadVendorData(id: string): void {
    this.loading = true;
    const url = `manufacturer-vendors/${id}`;
    
    this.authService.get(url).subscribe(
      (vendor: any) => {
        this.vendorForm.patchValue(vendor);
        this.loading = false;
      },
      (err) => {
        console.error('Error loading vendor:', err);
        this.communicationService.customError1('Failed to load vendor data');
        this.loading = false;
      }
    );
  }

  onSubmit(): void {
    if (this.vendorForm.invalid) {
      this.markFormGroupTouched(this.vendorForm);
      this.communicationService.customError1('Please fill all required fields correctly');
      return;
    }

    this.loading = true;
    const vendorData = {
      ...this.vendorForm.value,
      manufacturerEmail: this.manufacturerEmail
    };

    const url = this.isEditMode 
      ? `manufacturer-vendors/${this.vendorId}` 
      : 'manufacturer-vendors';

    const apiCall = this.isEditMode
      ? this.authService.patchpimage(url, vendorData)
      : this.authService.post(url, vendorData);

    apiCall.subscribe(
      () => {
        this.communicationService.customSuccess(
          `Vendor ${this.isEditMode ? 'updated' : 'created'} successfully`
        );
        this.router.navigate(['/mnf/view-vendor-list']);
      },
      (err) => {
        console.error('Error saving vendor:', err);
        this.communicationService.customError1(
          err.error?.message || 'Failed to save vendor'
        );
        this.loading = false;
      }
    );
  }

  cancel(): void {
    this.location.back();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.vendorForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Invalid email address';
    }
    if (control?.hasError('pattern')) {
      return 'Invalid format';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    }
    
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vendorForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
