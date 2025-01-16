import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cdn-mng',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    NgxSpinnerModule
  ],
  templateUrl: './cdn-mng.component.html',
  styleUrl: './cdn-mng.component.scss'
})
export class CDNMNGComponent {
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
  // cdnPath: string = '';
  userProfile: any;
  isEditing = false;
  actionName = "Add"
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    // this.cdnPath = this.authService.cdnPath;
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.initializeForm();
    this.getAllBrands();
  }

  initializeForm() {
    this.brandForm = this.fb.group({
     name: ['', Validators.required],
  
    });
  }

 


  onSubmit() {
    if (this.brandForm.valid) {
      const formData = new FormData();
   
      if (this.formType === 'Save') {
        this.authService.post('cdn-path', this.brandForm.value).subscribe((res: any) => {
          this.resetForm();
          this.getAllBrands();
        });
      } else {
       
      }
      this.getAllBrands();
    }
  }

  getAllBrands() {
    this.spinner.show();
    this.authService.get(`cdn-path`).subscribe((res: any) => {
      console.log(res);
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this CDN?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.delete(`cdn-path`, user).subscribe((res) => {
          this.communicationService.showNotification('snackbar-success', 'CDN Deleted successfully', 'bottom', 'center');
          this.getAllBrands();
        });
      }
    });
  }

  editForm(data: any) {
    this.isEditing = true;
    this.brandForm.patchValue(data);
    this.formType = 'Update';
    this.actionName = "Edit";
    this.imagePreview = data.brandLogo;
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
    this.actionName = "Add";
  }
}
