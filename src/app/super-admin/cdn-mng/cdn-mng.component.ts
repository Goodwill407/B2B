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
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexXAxis, ApexDataLabels, ApexTooltip, ApexYAxis } from 'ng-apexcharts';
@Component({
  selector: 'app-cdn-mng',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    NgxSpinnerModule,
    NgApexchartsModule,
    
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
    bucketName: ['', Validators.required],
     region: ['', Validators.required],
     accessKey: ['', Validators.required],
     secreteKey: ['', Validators.required],
  
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
  
    this.authService.get('cdn-path').subscribe(
      (res: any) => {
        // console.log('Distributors Response:', res);
        this.distributors = res.results;
  
        const bucketNames = this.distributors.map((d: any) => d.bucketName);
  
        const bucketRequests = bucketNames.map((bucketName: string) =>
          this.authService.get(`cdn-path/space-usage/bucket?bucketName=${bucketName}`).toPromise()
        );
  
        Promise.all(bucketRequests)
          .then((bucketResponses: any[]) => {
            this.distributors = this.distributors.map((distributor: any, index: number) => {
              // console.log('Bucket Response for', distributor.bucketName, ':', bucketResponses[index]);
              const bucketData = bucketResponses[index] || [];
              // console.log('Bucket Data:', bucketData);
              return {
                ...distributor,
                bucketDetails: bucketData,
              };
            });
  
            // console.log('Combined Distributors Data:', this.distributors);
            this.spinner.hide();
          })
          .catch((err: any) => {
            this.spinner.hide();
            // console.error('Error fetching bucket details:', err);
            this.communicationService.showNotification(
              'snackbar-danger',
              'Error fetching bucket details: ' + err.message,
              'bottom',
              'center'
            );
          });
      },
      (err: any) => {
        this.spinner.hide();
        // console.error('Error fetching distributors:', err);
        this.communicationService.showNotification(
          'snackbar-danger',
          err.error.message,
          'bottom',
          'center'
        );
      }
    );
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
  updateData(distributor: any) {
    if (!distributor || !distributor.id) {
      // console.error('Invalid distributor object or missing id:', distributor);
      return;
    }
  
    const body = {
      id: distributor.id,
      bucketName: distributor.bucketName,
      region: distributor.region,
      status: distributor.status,
    };
  
    // Send the PUT or PATCH request with the updated data
    this.authService.patch('cdn-path', body).subscribe(
      (res: any) => {
        this.communicationService.showNotification(
          'snackbar-success',
          'CDN updated successfully.',
          'bottom',
          'center'
        );
        this.getAllBrands(); // Refresh the data
      },
      (err: any) => {
        // console.error('Error updating CDN:', err);
        this.communicationService.showNotification(
          'snackbar-danger',
          err.error.message,
          'bottom',
          'center'
        );
      }
    );
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

  toggleStatus(distributor: any) {
    if (!distributor || !distributor.id) {
        // console.error('Invalid distributor object or missing id:', distributor);
        return;
    }

    // Update the selected distributor to active
    distributor.status = 'active';

    // Update all other distributors to inactive
    const updatedDistributors = this.distributors.map((item: any) => {
        if (item.id !== distributor.id) {
            return { ...item, status: 'inactive' };
        }
        return item;
    });

    // Update the UI
    this.distributors = updatedDistributors;

    // Prepare the body for the API call
    const body = {
        id: distributor.id,
        status: 'active',
    };

    // Send the PATCH request with the body
    this.authService.patch(`cdn-path`, body).subscribe(
        (res: any) => {
            this.communicationService.showNotification(
                'snackbar-success',
                `${distributor.name} is now active.`,
                'bottom',
                'center'
            );
        },
        (err: any) => {
            this.communicationService.showNotification(
                'snackbar-danger',
                err.error.message,
                'bottom',
                'center'
            );
        }
    );

    // Send PATCH requests for inactive distributors
    updatedDistributors
        .filter((item: any) => item.id !== distributor.id)
        .forEach((item: any) => {
            const inactiveBody = {
                id: item.id,
                status: 'inactive',
            };

            this.authService.patch(`cdn-path`, inactiveBody).subscribe(
                () => {},
                (err: any) => {
                    this.communicationService.showNotification(
                        'snackbar-danger',
                        err.error.message,
                        'bottom',
                        'center'
                    );
                }
            );
        });
}

getUsedPercentage(bucketDetails: any): number {
  if (!bucketDetails) return 0; // Handle missing details
  const used = parseFloat(bucketDetails.usedSizeInGB) || 0;
  const total = parseFloat(bucketDetails.totalSizeInGB) || 1; // Avoid division by zero
  return (used / total) * 100; // Calculate percentage
}

convertToMB(sizeInGB: string): number {
  return parseFloat(sizeInGB) * 1024; // Convert GB to MB
}


}
