import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-mfg-add-staff',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
  ],
  templateUrl: './mfg-add-staff.component.html',
  styleUrls: ['./mfg-add-staff.component.scss'],
})
export class MfgAddStaffComponent implements OnInit {
  staffForm!: FormGroup;
  formType: string = 'Save';
  staffList: any[] = [];
  totalResults: number = 0;
  limit: number = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  deleteBtnDisabled: boolean = false;
  panelType: string = 'Add';
  selectedRoleFilter: string = '';
  showPassword: boolean = false;

  staffRoles = [
    { label: 'Raw Material Manager', value: 'rawMaterialManager' },
    { label: 'Finished Goods Manager', value: 'finishedGoodsManager' },
    { label: 'Product Manager', value: 'productManager' },
    { label: 'Order Manager', value: 'orderManager' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getAllStaff();
  }

  initializeForm(): void {
    this.staffForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/),
        ],
      ],
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      role: ['', Validators.required],
      id: [''],
    });
  }

  onSubmit(): void {
    if (this.staffForm.valid) {
      if (this.formType === 'Save') {
        const payload = { ...this.staffForm.value };
        delete payload.id;

        this.authService.post('users', payload).subscribe({
          next: () => {
            this.communicationService.showNotification(
              'snackbar-success',
              'Staff created successfully',
              'bottom',
              'center'
            );
            this.resetForm();
            this.getAllStaff();
          },
          error: (err: any) => {
            const msg = err?.error?.message || 'Failed to create staff';
            this.communicationService.showNotification(
              'snackbar-danger',
              msg,
              'bottom',
              'center'
            );
          },
        });
      } else {
        const id = this.staffForm.get('id')?.value;
        const payload = { ...this.staffForm.value };
        delete payload.id;
        delete payload.password; // don't send password on update
        delete payload.role;
        delete payload.mobileNumber;

        this.authService
          .patchpimage(`users/${id}`, payload)
          .subscribe({
            next: () => {
              this.communicationService.showNotification(
                'snackbar-success',
                'Staff updated successfully',
                'bottom',
                'center'
              );
              this.resetForm();
              this.getAllStaff();
            },
            error: (err: any) => {
              const msg = err?.error?.message || 'Failed to update staff';
              this.communicationService.showNotification(
                'snackbar-danger',
                msg,
                'bottom',
                'center'
              );
            },
          });
      }
    }
  }

  getAllStaff(): void {
    const email = this.authService.currentUserValue.email;
    let url = `/users?createdBy=${email}&page=${this.page}&limit=${this.limit}`;
    if (this.selectedRoleFilter) {
      url += `&role=${this.selectedRoleFilter}`;
    }
    this.authService.get(url).subscribe((res: any) => {
      this.staffList = res.results;
      this.totalResults = res.totalResults;
    });
  }

  onRoleFilterChange(): void {
    this.page = 1;
    this.first = 0;
    this.getAllStaff();
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.first = event.first;
    this.getAllStaff();
  }

  editStaff(data: any): void {
    this.staffForm.patchValue({
      fullName: data.fullName,
      email: data.email,
      mobileNumber: data.mobileNumber,
      role: data.role,
      id: data.id,
    });
    // password not required for edit
    this.staffForm.get('password')?.clearValidators();
    this.staffForm.get('password')?.updateValueAndValidity();
    this.formType = 'Update';
    this.panelType = 'Edit';
    this.deleteBtnDisabled = true;
  }

  deleteStaff(staff: any): void {
    this.authService.delete('users', staff.id).subscribe({
      next: () => {
        this.communicationService.showNotification(
          'snackbar-success',
          'Staff deleted successfully',
          'bottom',
          'center'
        );
        this.getAllStaff();
      },
      error: () => {
        this.communicationService.showNotification(
          'snackbar-danger',
          'Failed to delete staff',
          'bottom',
          'center'
        );
      },
    });
  }

  resetForm(): void {
    this.staffForm.reset({
      fullName: '',
      email: '',
      password: '',
      mobileNumber: '',
      role: '',
      id: '',
    });
    // restore password validators
    this.staffForm
      .get('password')
      ?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d).+$/),
      ]);
    this.staffForm.get('password')?.updateValueAndValidity();
    this.formType = 'Save';
    this.panelType = 'Add';
    this.deleteBtnDisabled = false;
    this.showPassword = false;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getRoleLabel(roleValue: string): string {
    return this.staffRoles.find((r) => r.value === roleValue)?.label || roleValue;
  }
}