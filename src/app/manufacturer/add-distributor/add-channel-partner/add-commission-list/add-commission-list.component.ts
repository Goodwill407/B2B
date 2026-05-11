import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-add-commission-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    MatTabsModule
  ],
  templateUrl: './add-commission-list.component.html',
  styleUrls: ['./add-commission-list.component.scss'],
})
export class AddCommissionListComponent implements OnInit {
  commissionForm!: FormGroup;
  formType: string = 'Save';
  commissionList: any[] = [];
  totalResults: number = 0;
  limit: number = 10;
  page: number = 1;
  first: number = 0;
  rows: number = 10;
  deleteBtnDisabled: boolean = false;
  categoryType: string = 'Add';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getAllCommissions();
  }

  initializeForm(): void {
    this.commissionForm = this.fb.group({
      category: ['', Validators.required],
      productCommission: ['', Validators.required],
      // shippingCommission: ['', Validators.required],
      categoryBy: [this.authService.currentUserValue.email, Validators.required],
      id: ['']
    });
  }

  onSubmit(): void {
    if (this.commissionForm.valid) {
      if (this.formType === 'Save') {
        this.authService.post('manufacture-commission', this.commissionForm.value).subscribe((res: any) => {
          this.communicationService.showNotification('snackbar-success', 'Commission created successfully', 'bottom', 'center');
          this.resetForm();
          this.getAllCommissions();
        });
      } else {
        const id = this.commissionForm.get('id')?.value;
        this.authService.patchpimage(`manufacture-commission/${id}`, this.commissionForm.value).subscribe((res: any) => {
          this.communicationService.showNotification('snackbar-success', 'Commission updated successfully', 'bottom', 'center');
          this.resetForm();
          this.getAllCommissions();
        });
      }
    }
  }

  getAllCommissions(): void {
    this.authService
      .get(`manufacture-commission?page=${this.page}&limit=${this.limit}&categoryBy=${this.authService.currentUserValue.email}`)
      .subscribe((res: any) => {
        this.commissionList = res.results;
        this.totalResults = res.totalResults;
      });
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllCommissions();
  }

  editCommission(data: any): void {
    this.commissionForm.patchValue(data);
    this.formType = 'Update';
    this.categoryType = 'Edit';
    this.deleteBtnDisabled = true;
  }

  deleteCommission(commission: any): void {
    this.authService.delete('manufacture-commission', commission.id).subscribe(() => {
      this.communicationService.showNotification('snackbar-success', 'Commission deleted successfully', 'bottom', 'center');
      this.getAllCommissions();
    });
  }

  resetForm(): void {
    this.commissionForm.reset({
      category: '',
      productCommission: '',
      // shippingCommission: '',
      categoryBy: this.authService.currentUserValue.email,
      id: ''
    });
    this.formType = 'Save';
    this.categoryType = 'Add';
    this.deleteBtnDisabled = false;
  }
}