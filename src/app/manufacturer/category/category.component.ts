import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
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
    TableModule,
    MatTabsModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  categoryForm1!: FormGroup;
  categoryForm2!: FormGroup;
  formType: string = 'Save';
  wholesalerCategory: any;
  retailerCategory: any;
  totalResultsWholesaler: any;
  totalResultsRetailer: any;
  limit = 10;
  pageWholesaler: number = 1;
  pageRetailer: number = 1;
  firstWholesaler: number = 0;
  firstRetailer: number = 0;
  rows: number = 10;
  deleteBtnDisabled: boolean = false;
  activeTab: string = 'wholesaler'; // Track active tab

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private router: Router) { }

  ngOnInit() {
    this.initializeForms();
    this.getAllWholesalerCategory();
    this.getAllRetailerCategory();
  }

  initializeForms() {
    this.categoryForm1 = this.fb.group({
      category: ['', Validators.required],
      shippingDiscount: ['', Validators.required],
      productDiscount: ['', Validators.required],
      categoryBy: [this.authService.currentUserValue.email, Validators.required],
      id: ['']
    });

    this.categoryForm2 = this.fb.group({
      category: ['', Validators.required],
      productDiscount: ['', Validators.required],
      shippingDiscount: ['', Validators.required],
      categoryBy: [this.authService.currentUserValue.email, Validators.required],
      id: ['']
    });
  }

  onSubmit(formType: string) {
    if (formType === 'wholesaler' && this.categoryForm1.valid) {
      this.submitWholesalerCategory();
    } else if (formType === 'retailer' && this.categoryForm2.valid) {
      this.submitRetailerCategory();
    }
  }

  submitWholesalerCategory() {
    if (this.formType === 'Save') {
      this.authService.post('wholesaler-category', this.categoryForm1.value).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Wholesaler category created successfully', 'bottom', 'center');
        this.resetForm(this.categoryForm1);
        this.getAllWholesalerCategory();
      });
    } else {
      this.authService.patch('wholesaler-category', this.categoryForm1.value).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Wholesaler category updated successfully', 'bottom', 'center');
        this.resetForm(this.categoryForm1);
        this.getAllWholesalerCategory();
      });
    }
  }

  submitRetailerCategory() {
    if (this.formType === 'Save') {
      this.authService.post('retailer-category', this.categoryForm2.value).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Retailer category created successfully', 'bottom', 'center');
        this.resetForm(this.categoryForm2);
        this.getAllRetailerCategory();
      });
    } else {
      this.authService.patch('retailer-category', this.categoryForm2.value).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Retailer category updated successfully', 'bottom', 'center');
        this.resetForm(this.categoryForm2);
        this.getAllRetailerCategory();
      });
    }
  }

  getAllWholesalerCategory() {
    this.authService.get(`wholesaler-category?page=${this.pageWholesaler}&limit=${this.limit}&categoryBy=${this.authService.currentUserValue.email}`).subscribe((res: any) => {
      this.wholesalerCategory = res.results;
      this.totalResultsWholesaler = res.totalResults;
    });
  }

  getAllRetailerCategory() {
    this.authService.get(`retailer-category?page=${this.pageRetailer}&limit=${this.limit}&categoryBy=${this.authService.currentUserValue.email}`).subscribe((res: any) => {
      this.retailerCategory = res.results;
      this.totalResultsRetailer = res.totalResults;
    });
  }

  onPageChangeWholesaler(event: any) {
    this.pageWholesaler = event.page + 1;
    this.limit = event.rows;
    this.getAllWholesalerCategory();
  }

  onPageChangeRetailer(event: any) {
    this.pageRetailer = event.page + 1;
    this.limit = event.rows;
    this.getAllRetailerCategory();
  }

  deleteWholesalerCategory(category: any) {
    this.authService.delete('wholesaler-category', category.id).subscribe((res) => {
      this.communicationService.showNotification('snackbar-success', 'Wholesaler category deleted successfully', 'bottom', 'center');
      this.getAllWholesalerCategory();
    });
  }

  deleteRetailerCategory(category: any) {
    this.authService.delete('retailer-category', category.id).subscribe((res) => {
      this.communicationService.showNotification('snackbar-success', 'Retailer category deleted successfully', 'bottom', 'center');
      this.getAllRetailerCategory();
    });
  }

  editForm(data: any, userType: string) {
    if (userType === 'wholesaler') {
      this.categoryForm1.patchValue(data);
      this.deleteBtnDisabled = true;
    } else if (userType === 'retailer') {
      this.categoryForm2.patchValue(data);
      this.deleteBtnDisabled = true;
    }
    this.formType = 'Update';
  }

  resetForm(form: FormGroup) {
    form.reset();
    form.reset({
      category: '',
      productDiscount: '',
      shippingDiscount: '',
      categoryBy: this.authService.currentUserValue.email, // Keep default values if necessary
      id: ''
    });
    this.formType = 'Save';
    this.deleteBtnDisabled = false; // Reset delete button state
  }

  // Handle tab changes
  onTabChange(event: any) {
    this.activeTab = event.index === 0 ? 'wholesaler' : 'retailer';
    this.resetForm(this.activeTab === 'wholesaler' ? this.categoryForm1 : this.categoryForm2);
  }
}
