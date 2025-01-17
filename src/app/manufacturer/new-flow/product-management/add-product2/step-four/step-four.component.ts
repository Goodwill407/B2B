import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-step-four',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './step-four.component.html',
  styleUrl: './step-four.component.scss'
})
export class StepFourComponent {
  @Input() productId: any;
  @Output() next = new EventEmitter<any>();
  stepThree: FormGroup = this.fb.group({});
  submittedStep2: boolean = false;   
  userProfile: any;
  productDetails: any;
  selectedSizes: string[] = [];
  colourCollections: any[] = [];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private router: Router,
    private communicationService:CommunicationService

  ) {
    
  }

  ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);   
    if (this.productId) {
      this.getProductDataById();
    }
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
      if (res) {
        this.productDetails = res;       
        this.colourCollections = this.productDetails.colourCollections;
        this.selectedSizes = this.productDetails.sizes.map((item: any) => item.standardSize);
        
        this.createFormControls2();
        this.patchInventoryData();
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  createFormControls2() {
    this.colourCollections.forEach((color: any) => {
      const sanitizedColorName = this.sanitizeControlName(color.colourName);
      this.selectedSizes.forEach((size: string) => {       
        const minimumControlName = `min_${sanitizedColorName}_${size}`;  

        if (!this.stepThree.contains(minimumControlName)) {
          this.stepThree.addControl(minimumControlName, new FormControl('', Validators.min(0)));
        }
      });
    });
  }

  sanitizeControlName(colourName: string): string {
    return colourName.replace(/\s+/g, '_').toLowerCase();
  }

  getControlName(colourName: string, size: string): string {
    return `${this.sanitizeControlName(colourName)}_${size}`;
  }

  patchInventoryData() {   
    const minimumStockData = this.productDetails.minimumStock || [];
    const patchObject: any = {};  
    // Patch minimum stock quantities
    minimumStockData.forEach((item: any) => {
      const sanitizedColorName = this.sanitizeControlName(item.colourName);
      const minControlName = `min_${sanitizedColorName}_${item.size}`;
      
      if (this.stepThree.contains(minControlName)) {
        patchObject[minControlName] = item.quantity; // Patch minimum quantity
      }
    });
  
    // Apply all patched values to the form
    this.stepThree.patchValue(patchObject);
  }



  async saveStepThree() {
    this.submittedStep2 = true;
    
    if (this.stepThree.valid) {
      const formData = this.stepThree.value;     
      const minimumStock: any[] = [];
  
      this.colourCollections.forEach((color: any) => {
        const sanitizedColorName = this.sanitizeControlName(color.colourName);
        
        this.selectedSizes.forEach((size: string) => {        
          const minimumControlName = `min_${sanitizedColorName}_${size}`;          
         
          const minimumQuantity = formData[minimumControlName];         
  
          if (minimumQuantity !== null && minimumQuantity !== undefined) {
            minimumStock.push({
              colourName: color.colourName,
              colourImage: color.colourImage,
              colour: color.colour,
              quantity: minimumQuantity,
              size: size
            });
          }
        });
      });
  
      const payload = {minimumStock, id: this.productId };
      
      try {
        this.spinner.show();
        const res = await this.authService.patch('type2-products', payload).toPromise();
        if (res) {
          this.communicationService.showNotification(
            'snackbar-success',
            'Saved Successfully...!!!',
            'bottom',
            'center'
          );
          setTimeout(() => {
            this.router.navigate(['mnf/new/manage-product2']);
          }, 1500);
        }
      } catch (error) {
        console.error('Error occurred while saving:', error); // Log the error for debugging
        this.communicationService.showNotification(
          'snackbar-error',
          'Error occurred while saving...!!!',
          'bottom',
          'center'
        );
      } finally {
        this.spinner.hide();
      }
    } else {
      // Optional: Handle the case when the form is not valid
      this.communicationService.showNotification(
        'snackbar-warning',
        'Please fill out all required fields...!!!',
        'bottom',
        'center'
      );
    }
  }
}
