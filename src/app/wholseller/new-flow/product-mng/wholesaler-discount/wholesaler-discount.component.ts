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
  selector: 'app-wholesaler-discount',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    MatTabsModule
  ],
  templateUrl: './wholesaler-discount.component.html',
  styleUrl: './wholesaler-discount.component.scss'
})

export class WholesalerDiscountComponent {
  categoryForm2!: FormGroup;
  formType: string = 'Save';
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
  userProfile: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService, private router: Router) { }

  ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    console.log(this.userProfile)
    this.initializeForms();
    this.getAllRetailerCategory();
  }

  initializeForms() {
    this.categoryForm2 = this.fb.group({
      category: ['', Validators.required],
      productDiscount: ['', Validators.required],
      shippingDiscount: ['', Validators.required],
      categoryBy: [this.userProfile.email, Validators.required],
      id:[""]
    });
  }

  onSubmit() {
    this.submitRetailerCategory();
  }

  submitRetailerCategory() {
    if (this.formType === 'Save') {
      delete this.categoryForm2.value.id;
      this.authService.post('retailer-category', this.categoryForm2.value).subscribe((res: any) => {
        console.log(res);
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



  getAllRetailerCategory() {
    this.authService.get(`retailer-category?page=${this.pageRetailer}&limit=${this.limit}&categoryBy=${this.userProfile.email}`).subscribe((res: any) => {
      this.retailerCategory = res.results;
      this.totalResultsRetailer = res.totalResults;
    });
  }


  onPageChangeRetailer(event: any) {
    this.pageRetailer = event.page + 1;
    this.limit = event.rows;
    this.getAllRetailerCategory();
  }


  deleteRetailerCategory(category: any) {
    this.authService.delete('retailer-category', category.id).subscribe((res) => {
      this.communicationService.showNotification('snackbar-success', 'Retailer category deleted successfully', 'bottom', 'center');
      this.getAllRetailerCategory();
    });
  }

  editForm(data: any) {
    this.categoryForm2.patchValue(data);
    this.deleteBtnDisabled = true;
    this.formType = 'Update';
  }

  resetForm(form: FormGroup) {
    form.reset();
    form.reset({
      category: '',
      productDiscount: '',
      shippingDiscount: '',
      categoryBy: this.userProfile.email, // Keep default values if necessary

    });
    this.formType = 'Save';
    this.deleteBtnDisabled = false; // Reset delete button state
  }

 
}

