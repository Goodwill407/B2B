import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-step-three',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.scss'],
  providers: [DatePipe]
})
export class StepThreeComponent {
  @Input() productId: any; // Allow nullable type
  @Output() next = new EventEmitter<any>(); // Emit event to notify the parent component of the navigation
  stepThree: FormGroup;
  submittedStep2: boolean = false; 
  selectedColorGroupIndex: number | null = null; 
  CloudPath: string = '';   
  showFlag2: boolean = false; 
  userProfile: any;
  productDetails: any;
  selectedSizes: string[] = [];
  colourCollections: any[] = [];
  showFlag: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private direction: DirectionService,
    private router: Router
  ) {
    this.stepThree = this.fb.group({});
    this.CloudPath = this.authService.cdnPath;
  }

  ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);   
    if (this.productId) {
      this.getProductDataById();
    }
  }  

  // Create controls for quantity input
  createFormControls2() {
    this.colourCollections.forEach((color: any) => {
      const sanitizedColorName = this.sanitizeControlName(color.colourName); // Ensure control name compatibility
      this.selectedSizes.forEach((size: string) => {
        const controlName = `${sanitizedColorName}_${size}`;
        this.stepThree.addControl(controlName, new FormControl(''));
      });
    });
  }

  // Helper method to sanitize control names if necessary
  sanitizeControlName(colourName: string): string {
    return colourName.replace(/\s+/g, '_').toLowerCase();
  }

  // Get control name for the form input
  getControlName(colourName: string, size: string): string {
    return `${this.sanitizeControlName(colourName)}_${size}`;
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
      if (res) {
        this.productDetails = res;       
        this.colourCollections = this.productDetails.colourCollections;
        this.selectedSizes = this.productDetails.sizes.map((item: any) => item.standardSize);
        
        if (this.productDetails) {
          this.createFormControls2();
          this.patchInventoryData();
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  patchInventoryData() {
    const inventoryData = this.productDetails.inventory || [];
    const patchObject: any = {};

    inventoryData.forEach((item: any) => {
      const sanitizedColorName = this.sanitizeControlName(item.colourName); // Ensure control name compatibility
      const controlName = `${sanitizedColorName}_${item.size}`;

      console.log('Attempting to patch:', controlName, 'with quantity:', item.quantity);

      if (this.stepThree.contains(controlName)) {
        patchObject[controlName] = item.quantity;
      } else {
        console.warn('Control not found for:', controlName);
      }
    });

    console.log('Patching form with:', patchObject);
    this.stepThree.patchValue(patchObject);
  }

  async saveStepThree() {    
    this.submittedStep2 = true;

    if (this.stepThree.valid) {
      const formData = this.stepThree.value;
      const result: any[] = [];

      this.colourCollections.forEach((color: any) => {
        const sanitizedColorName = this.sanitizeControlName(color.colourName);
        this.selectedSizes.forEach((size: string) => {
          const quantity = formData[`${sanitizedColorName}_${size}`];
          if (quantity) {
            result.push({
              colourName: color.colourName,
              colourImage: color.colourImage,
              colour: color.colour,
              quantity,
              size,
            });
          }
        });
      });

      const payload = {
        inventory: result,
        id: this.productId
      };

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
        this.communicationService.showNotification(
          'snackbar-error',
          'Error occurred while saving...!!!',
          'bottom',
          'center'
        );
      } finally {
        this.spinner.hide();
      }
    }
  }
}
