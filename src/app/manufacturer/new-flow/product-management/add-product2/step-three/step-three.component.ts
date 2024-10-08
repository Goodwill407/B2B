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
    CommonModule,
    NgxSpinnerModule,],
  templateUrl: './step-three.component.html',
  styleUrl: './step-three.component.scss',
  providers:[DatePipe]
})
export class StepThreeComponent {
  @Input() productId: any; // Allow nullable type
  @Output() next = new EventEmitter<any>(); // Emit event to notify the parent component of the navigation
  stepThree:FormGroup;
  submittedStep2: boolean = false; 
  selectedColorGroupIndex: number | null = null; 
  CloudPath: string = ''   
  showFlag2: boolean = false; 
  userProfile: any
  productDetails: any
  selectedSizes: any = []
  colourCollections: any = []  
  showFlag: boolean = false;
 


  constructor( private authService: AuthService,
    private fb:FormBuilder,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private direction: DirectionService,
    private router:Router) {
    this.stepThree = this.fb.group({});

    this.CloudPath = this.authService.cdnPath
  }

  ngOnInit() {
    // call master    
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);   
    if (this.productId) {
      this.getProductDataById()
        }
  }  

  // create conrolar for quintity input
  createFormControls2() {
    this.colourCollections.forEach((color:any) => {
      this.selectedSizes.forEach((size:any) => {
        this.stepThree.addControl(`${color.colourName}_${size}`, new FormControl(''));
      });
    });
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
     if (res) {
        this.productDetails = res;
        this.colourCollections=this.productDetails.colourCollections
        this.selectedSizes = this.productDetails.sizes.filter((item: any) => item.standardSize !== "");
        if( this.productDetails){
          this.createFormControls2()  // Create Form COntrols
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      this.spinner.hide();
    }
  }
  
  async saveStepThree(type: any = '') {    
    this.submittedStep2 = true;
  
    if (this.stepThree.valid) {
      const formData = this.stepThree.value;
      const result: any = [];
  
      this.colourCollections.forEach((color:any) => {
        this.selectedSizes.forEach((size:any) => {
          const quantity = formData[`${color.colourName}_${size}`];
          if (quantity) {
            result.push({
              colourName: color.colourName,
              colourImage: color.colourImage,
              colour: color.colour,
              quantity: quantity,
              size: size,
            });
          }
        });
      });          
      const object:any={
        inventory:result
      }   
      object.id=this.productId; 
  
      try {
        this.spinner.show();
        const res: any = await this.authService.patch(`type2-products`, object).toPromise();
        if (res) {
          this.spinner.hide();
          // this.resetForm();
          this.communicationService.showNotification(
            'snackbar-success',
            `Saved Successfully...!!!`,
            'bottom',
            'center'
          );          
          setTimeout(() => {
            this.router.navigate([`mnf/manage-product`]);
          }, 1500);
        }
      } catch (error) {
        this.spinner.hide();
        // Handle error, e.g., show notification or log error
        this.communicationService.showNotification(
          'snackbar-error',
          `Error occurred while saving...!!!`,
          'bottom',
          'center'
        );
      }
    }
  }  

  
}
