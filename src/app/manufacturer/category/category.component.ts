import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {
  categoryForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  formType: string = 'Save';
  imageError: string = '';
  imageFormatError: string = '';
  distributors: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  cdnPath: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private router: Router) { }

  ngOnInit() {
    this.cdnPath = this.authService.cdnPath;
    this.initializeForm();
    this.getAllBrands();
  }

  initializeForm() {
    this.categoryForm = this.fb.group({
      category: ['', Validators.required],
      categoryBy: ['', Validators.required],
      id: ['']
    });
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          this.imageError = '';
          this.imageFormatError = '';

          const validFormat = file.type === 'image/jpeg' || file.type === 'image/png';

          if (!validFormat) {
            this.imageFormatError = 'Invalid image format. Please upload an image in jpeg/png format.';
          }

          if (validFormat) {
            this.imagePreview = reader.result;
            this.categoryForm.patchValue({ brandLogo: file });
            this.categoryForm.get('brandLogo')?.updateValueAndValidity();
          } else {
            this.imagePreview = null;
            this.categoryForm.patchValue({ brandLogo: null });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const formData = new FormData();
      formData.append('brandName', this.categoryForm.get('brandName')?.value);
      formData.append('brandDescription', this.categoryForm.get('brandDescription')?.value);
      formData.append('brandLogo', this.categoryForm.get('brandLogo')?.value);

      if (this.formType === 'Save') {
        this.authService.post('brand', formData).subscribe((res: any) => {
          this.communicationService.showNotification('snackbar-success', 'Brand created successfully', 'bottom', 'center');
          this.resetForm();
        });
      } else {
        formData.append('id', this.categoryForm.get('id')?.value);
        this.authService.patch(`brand`, formData).subscribe((res: any) => {
          this.communicationService.showNotification('snackbar-success', 'Brand updated successfully', 'bottom', 'center');
          this.resetForm();
        });
      }
    }
  }

  getAllBrands() {
    this.authService.get(`brand?page=${this.page}&limit=${this.limit}`).subscribe((res: any) => {
      this.distributors = res.results;
      this.totalResults = res.totalResults;
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllBrands();
  }

  deleteData(user: any) {
    this.authService.delete(`brand`, user.id).subscribe((res) => {
      this.communicationService.showNotification('snackbar-success', 'Brand Deleted successfully', 'bottom', 'center');
      this.getAllBrands();
    });
  }

  editForm(data: any) {
    this.categoryForm.patchValue(data);
    this.formType = 'Update';
    this.imagePreview = this.cdnPath + data.brandLogo;
    this.categoryForm.get('brandLogo')?.setValidators(null); // Remove validators for editing
    this.categoryForm.get('brandLogo')?.updateValueAndValidity();
  }

  resetForm() {
    this.categoryForm.reset();
    this.imagePreview = null;
    this.formType = 'Save';
    this.categoryForm.get('brandLogo')?.setValidators([Validators.required]); // Re-add validators for new entries
    this.categoryForm.get('brandLogo')?.updateValueAndValidity();
    this.getAllBrands();
  }
}

