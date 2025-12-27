import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-main-sub-category-add-update',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    DividerModule,
  ],
  templateUrl: './main-sub-category-add-update.component.html',
  styleUrl: './main-sub-category-add-update.component.scss',
})
export class MainSubCategoryAddUpdateComponent implements OnInit {
  categoryForm!: FormGroup;
  subcategoriesForm!: FormGroup;
  
  isEditMode = false;
  categoryId: string | null = null;
  categoryCreated = false;
  loading = false;
  savingSubcategories = false;
  manufacturerEmail = '';
  
  createdCategory: any = null; // Stores Step 1 response

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';

    this.categoryId = this.route.snapshot.paramMap.get('id');
    
    if (this.categoryId) {
      this.isEditMode = true;
      this.loadCategoryWithSubcategories(this.categoryId);
    }
  }

  initializeForms(): void {
    // Step 1: Category Form
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', Validators.required],
      description: [''],
      note: [''],
      isActive: [true],
    });

    // Step 2: Subcategories Form (FormArray)
    this.subcategoriesForm = this.fb.group({
      subcategories: this.fb.array([]),
    });
  }

  get subcategories(): FormArray {
    return this.subcategoriesForm.get('subcategories') as FormArray;
  }

  createSubcategoryGroup(initial?: any): FormGroup {
    return this.fb.group({
      subcategoryName: [initial?.subcategoryName || '', Validators.required],
      subcategoryCode: [initial?.subcategoryCode || '', Validators.required],
      description: [initial?.description || ''],
      note: [initial?.note || ''],
      isActive: [initial?.isActive !== undefined ? initial.isActive : true],
      id: [initial?.id || null], // For edit mode
    });
  }

  addSubcategory(): void {
    this.subcategories.push(this.createSubcategoryGroup());
  }

  removeSubcategory(index: number): void {
    this.subcategories.removeAt(index);
  }

  // STEP 1: Save Category
  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      this.communicationService.customError1('Please fill all required fields');
      return;
    }

    this.loading = true;

   const payload = {
      ...this.categoryForm.getRawValue(),
      categoryName: this.categoryForm.getRawValue().name, // Add this duplicate field
      manufacturerEmail: this.manufacturerEmail,
    };

    const url = this.isEditMode
      ? `manufacture-category/${this.categoryId}`
      : 'manufacture-category';

    const api$ = this.isEditMode
      ? this.authService.patchpimage(url, payload)
      : this.authService.post(url, payload);

    api$.subscribe(
      (res: any) => {
        this.createdCategory = res.data || res;
        this.categoryCreated = true;
        this.loading = false;
        
        this.communicationService.customSuccess(
          `Category ${this.isEditMode ? 'updated' : 'created'} successfully`
        );

        // Add one empty subcategory row by default
        if (this.subcategories.length === 0) {
          this.addSubcategory();
        }
      },
      (err) => {
        this.communicationService.customError1(
          err?.error?.message || 'Failed to save category'
        );
        this.loading = false;
      }
    );
  }

  // STEP 2: Save Subcategories (Bulk)
 saveSubcategories(): void {
  if (this.subcategoriesForm.invalid) {
    this.markFormGroupTouched(this.subcategoriesForm);
    this.communicationService.customError1('Please fill all required fields');
    return;
  }

  if (this.subcategories.length === 0) {
    this.communicationService.customError1('Please add at least one subcategory');
    return;
  }

  this.savingSubcategories = true;

  const subcategoriesData = this.subcategories.value;

  // Separate new and existing subcategories
  const newSubcategories = subcategoriesData
    .filter((sub: any) => !sub.id)
    .map((sub: any) => ({
      categoryId: this.createdCategory.id,
      categoryName: this.createdCategory.name,
      categoryCode: this.createdCategory.code,
      subcategoryName: sub.subcategoryName,
      subcategoryCode: sub.subcategoryCode,
      description: sub.description || '',
      note: sub.note || '',
      isActive: sub.isActive,
      manufacturerEmail: this.manufacturerEmail,
    }));

  const existingSubcategories = subcategoriesData.filter((sub: any) => sub.id);

  // If in edit mode and has existing subcategories - update them individually
  if (this.isEditMode && existingSubcategories.length > 0) {
    const updateRequests = existingSubcategories.map((sub: any) => {
      const payload = {
        categoryId: this.createdCategory.id,
        categoryName: this.createdCategory.name,
        categoryCode: this.createdCategory.code,
        subcategoryName: sub.subcategoryName,
        subcategoryCode: sub.subcategoryCode,
        description: sub.description || '',
        note: sub.note || '',
        isActive: sub.isActive,
        manufacturerEmail: this.manufacturerEmail,
      };
      return this.authService.patchpimage(`manufacture-subcategory/${sub.id}`, payload);
    });

    // Execute all PATCH requests
    Promise.all(updateRequests.map((req:any) => req.toPromise()))
      .then(() => {
        // After updating, create new ones if any
        if (newSubcategories.length > 0) {
          this.createNewSubcategories(newSubcategories);
        } else {
          this.communicationService.customSuccess('Subcategories updated successfully');
          this.savingSubcategories = false;
          this.router.navigate(['/mnf/view-categories']);
        }
      })
      .catch(() => {
        this.communicationService.customError1('Failed to update some subcategories');
        this.savingSubcategories = false;
      });
  } else if (newSubcategories.length > 0) {
    // Only new subcategories - bulk create
    this.createNewSubcategories(newSubcategories);
  } else {
    this.savingSubcategories = false;
    this.router.navigate(['/mnf/view-categories']);
  }
}

// Helper method for bulk creation
private createNewSubcategories(subcategories: any[]): void {
  this.authService.post('manufacture-subcategory', subcategories).subscribe(
    () => {
      this.communicationService.customSuccess(
        `${subcategories.length} subcategories created successfully`
      );
      this.savingSubcategories = false;
      this.router.navigate(['/mnf/view-categories']);
    },
    (err) => {
      this.communicationService.customError1(
        err?.error?.message || 'Failed to create subcategories'
      );
      this.savingSubcategories = false;
    }
  );
}


  // Edit Mode: Load Category + Subcategories
  loadCategoryWithSubcategories(id: string): void {
    this.loading = true;

    // Load Category
    this.authService.get(`manufacture-category/${id}`).subscribe(
      (res: any) => {
        this.createdCategory = res.data || res;
        this.categoryForm.patchValue(this.createdCategory);
        this.categoryCreated = true;

        // Load Subcategories
        this.authService
          .get(`manufacture-subcategory?categoryId=${id}`)
          .subscribe(
            (subRes: any) => {
              const data = subRes.data || subRes;
              const subs = data.results || [];

              this.subcategories.clear();
              if (subs.length > 0) {
                subs.forEach((sub: any) => {
                  this.subcategories.push(this.createSubcategoryGroup(sub));
                });
              } else {
                this.addSubcategory(); // Add one empty
              }

              this.loading = false;
            },
            () => {
              this.loading = false;
              this.addSubcategory();
            }
          );
      },
      () => {
        this.communicationService.customError1('Failed to load category');
        this.loading = false;
      }
    );
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
      if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  isFieldInvalid(form: FormGroup, path: string): boolean {
    const ctrl = form.get(path);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getErrorMessage(path: string): string {
    const control = this.categoryForm.get(path);
    if (!control) return '';
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) {
      const len = control.getError('minlength')?.requiredLength;
      return `Minimum length is ${len}`;
    }
    return '';
  }
}
