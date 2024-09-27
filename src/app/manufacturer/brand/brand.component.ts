import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    NgxSpinnerModule
  ],
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent {
  brandForm!: FormGroup;
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
  userProfile: any;
  isEditing = false;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.cdnPath = this.authService.cdnPath;
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.initializeForm();
    this.getAllBrands();
  }

  initializeForm() {
    this.brandForm = this.fb.group({
      brandName: ['', Validators.required],
      brandDescription: ['', Validators.required],
      brandLogo: [null, [Validators.required]],
      brandOwner: [this.userProfile.email],
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

                const validFormat = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';

                if (!validFormat) {
                    this.imageFormatError = 'Invalid image format. Please upload an image in jpeg/png/gif format.';
                }

                if (validFormat) {
                    this.imagePreview = reader.result;
                    this.brandForm.patchValue({ brandLogo: file });
                    this.brandForm.get('brandLogo')?.updateValueAndValidity();
                } else {
                    this.imagePreview = null;
                    this.brandForm.patchValue({ brandLogo: null });
                }
            };
        };
        reader.readAsDataURL(file);
    }
}


  onSubmit() {
    if (this.brandForm.valid) {
      this.spinner.show();
      const formData = new FormData();
      formData.append('brandName', this.brandForm.get('brandName')?.value);
      formData.append('brandDescription', this.brandForm.get('brandDescription')?.value);
      formData.append('brandOwner', this.brandForm.get('brandOwner')?.value);
      
      const brandLogo = this.brandForm.get('brandLogo')?.value;
      if (brandLogo && brandLogo instanceof File) {
          formData.append('brandLogo', brandLogo);
      }

      if (this.formType === 'Save') {
        this.authService.post('brand', formData).subscribe((res: any) => {
          this.resetForm();
        });
      } else {
        formData.append('id', this.brandForm.get('id')?.value);
        this.authService.patch(`brand`, formData).subscribe((res: any) => {
          this.resetForm();
        });
      }
    }
  }

  getAllBrands() {
    this.spinner.show();
    this.authService.get(`brand?page=${this.page}&limit=${this.limit}&brandOwner=${this.userProfile.email}`).subscribe((res: any) => {
      this.distributors = res.results;
      this.totalResults = res.totalResults;
      this.spinner.hide();
    }, (err: any) => {
      this.spinner.hide();
      this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
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
    this.isEditing = true;
    this.brandForm.patchValue(data);
    this.formType = 'Update';
    this.imagePreview = this.cdnPath + data.brandLogo;
    this.brandForm.get('brandLogo')?.setValidators(null); // Remove validators for editing
    this.brandForm.get('brandLogo')?.updateValueAndValidity();
  }

  resetForm() {
    this.brandForm.reset({
      brandName: '',
      brandDescription: '',
      brandOwner: this.authService.currentUserValue.email, // Keep default values if necessary
      id: ''
    });
    this.imagePreview = null;
    this.formType = 'Save';
    this.isEditing = false;
    this.fileInput.nativeElement.value = ''; // Clear the file input
    this.brandForm.get('brandLogo')?.setValidators([Validators.required]); // Re-add validators for new entries
    this.brandForm.get('brandLogo')?.updateValueAndValidity();
    this.getAllBrands();
  }
}
