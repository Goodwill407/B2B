import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-add-update-warehouse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputNumberModule,
  ],
  templateUrl: './add-update-warehouse.component.html',
  styleUrl: './add-update-warehouse.component.scss',
})
export class AddUpdateWarehouseComponent implements OnInit {
  warehouseForm!: FormGroup;
  isEditMode = false;
  warehouseId: string | null = null;
  loading = false;
  manufacturerEmail = '';

  columnNamingOptions = [
    { label: 'Numeric (1,2,3...)', value: 'numeric' },
    { label: 'Alphabetic (A,B,C...)', value: 'alphabetic' },
    { label: 'Alpha-Numeric (A1,A2...)', value: 'alpha-numeric' },
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
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';

    this.warehouseId = this.route.snapshot.paramMap.get('id');
    if (this.warehouseId) {
      this.isEditMode = true;
      this.loadWarehouseData(this.warehouseId);
    }
  }

  // convenience getter
 get racks(): FormArray<FormGroup> {
  return this.warehouseForm.get('racks') as FormArray<FormGroup>;
}

  initializeForm(): void {
    this.warehouseForm = this.fb.group({
      warehouseName: ['', [Validators.required, Validators.minLength(2)]],
      code: [''],
      contactPersonName: [''],
      contactNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
      altContactNumber: ['', Validators.pattern(/^[0-9]{10}$/)],
      email: ['', Validators.email],
      // gstNumber: [
      //   '',
      //   Validators.pattern(
      //     /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      //   ),
      // ],

      address: this.fb.group({
        line1: ['', Validators.required],
        line2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India', Validators.required],
        pinCode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      }),

      isPrimary: [false],
      storageCapacity: [''],
      notes: [''],
      isActive: [true],

      racks: this.fb.array([]),
    });
  }

  addRack(): void {
    this.racks.push(this.createRackGroup());
  }

  removeRack(index: number): void {
    this.racks.removeAt(index);
  }

  cancel(): void {
    this.location.back();
  }

  private markFormGroupTouched(group: FormGroup): void {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(path: string): boolean {
    const ctrl = this.warehouseForm.get(path);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getErrorMessage(path: string): string {
    const control = this.warehouseForm.get(path);
    if (!control) return '';
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Invalid email address';
    if (control.hasError('pattern')) return 'Invalid format';
    if (control.hasError('minlength')) {
      const len = control.getError('minlength')?.requiredLength;
      return `Minimum length is ${len}`;
    }
    return '';
  }

  // createRackGroup: update fields
private createRackGroup(initial?: any): FormGroup {
  return this.fb.group({
    rackName: [initial?.rackName || ''],
    rowCount: [initial?.rowCount || 0],
    notes: [initial?.notes || ''],
    // backend has rowNames/columnNames, but we compute rowNames here
    rowNames: [initial?.rowNames || []],
  });
}

// when loading from backend, pass rowCount + rowNames
loadWarehouseData(id: string): void {
  this.loading = true;
  const url = `manufacture-warehouse/${id}`;

  this.authService.get(url).subscribe(
    (warehouse: any) => {
      this.warehouseForm.patchValue({
        warehouseName: warehouse.warehouseName,
        code: warehouse.code,
        contactPersonName: warehouse.contactPersonName,
        contactNumber: warehouse.contactNumber,
        altContactNumber: warehouse.altContactNumber,
        email: warehouse.email,
        gstNumber: warehouse.gstNumber,
        address: warehouse.address,
        isPrimary: warehouse.isPrimary,
        storageCapacity: warehouse.storageCapacity,
        notes: warehouse.notes,
        isActive: warehouse.isActive,
      });

      this.racks.clear();
      (warehouse.racks || []).forEach((r: any) => {
        this.racks.push(this.createRackGroup(r));
      });

      this.loading = false;
    },
    () => {
      this.communicationService.customError1('Failed to load warehouse data');
      this.loading = false;
    }
  );
}

// helper to build rowNames for one rack
private buildRowNames(rackName: string, rowCount: number): string[] {
  const cleanName = (rackName || '').trim() || 'Rack';
  const count = Math.max(0, Number(rowCount) || 0);
  const names: string[] = [];
  for (let i = 1; i <= count; i++) {
    names.push(`${cleanName}-${i}`);
  }
  return names;
}

onSubmit(): void {
  if (this.warehouseForm.invalid) {
    this.markFormGroupTouched(this.warehouseForm);
    this.communicationService.customError1('Please fill all required fields correctly');
    return;
  }

  const racksValue = this.racks.value as any[];

  const cleanedRacks = racksValue
    .map((r) => {
      const rowCount = Number(r.rowCount) || 0;
      const rackName = (r.rackName || '').toString().trim();
      const notes = (r.notes || '').toString().trim();
      const rowNames = this.buildRowNames(rackName, rowCount);

      return {
        rackName,
        rowCount,
        notes,
        rowNames,
        // columns related fields ignored for now
      };
    })
    .filter((r) => r.rackName || r.rowCount > 0 || r.notes); // avoid completely empty rows

  if (cleanedRacks.length === 0) {
    this.communicationService.customError1('Please add at least one rack with valid details');
    return;
  }

  this.loading = true;

  const payload = {
    ...this.warehouseForm.value,
    manufacturerEmail: this.manufacturerEmail,
    racks: cleanedRacks,
    totalRacks: cleanedRacks.length,
    // for now we treat totalColumns as sum of rowCount (since columns are pending)
    totalColumns: cleanedRacks.reduce((sum, r) => sum + (r.rowCount || 0), 0),
  };

  const url = this.isEditMode
    ? `manufacture-warehouse/${this.warehouseId}`
    : 'manufacture-warehouse';

  const api$ = this.isEditMode
    ? this.authService.patchpimage(url, payload)
    : this.authService.post(url, payload);

  api$.subscribe(
    () => {
      this.communicationService.customSuccess(
        `Warehouse ${this.isEditMode ? 'updated' : 'created'} successfully`
      );
      this.router.navigate(['/mnf/view-warehouse-list']);
    },
    (err) => {
      this.communicationService.customError1(
        err?.error?.message || 'Failed to save warehouse'
      );
      this.loading = false;
    }
  );
}

}
