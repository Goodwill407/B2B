import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-step-two',
  standalone: true,
  imports: [
    ReactiveFormsModule,
     NgIf,
     NgClass,
     NgFor,
    MultiSelectModule,
    FormsModule,
    DialogModule,    
    CommonModule,
    NgxSpinnerModule,
  
  ],
  templateUrl: './step-two.component.html',
  styleUrl: './step-two.component.scss',
  providers:[DatePipe]
})
export class StepTwoComponent {
  @Input() productId: any  // Allow nullable type
  @Output() next = new EventEmitter<any>(); 
  stepTwo:FormGroup; 
 
  submittedStep2: boolean = false;
  submittedStep1 = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  CloudPath: string = ''
  
  showFlag2: boolean = false;
  videoSizeError: string = '';
  productDetails: any 
  colourCollections: any = []     
  locationData: any;
  showFlag: boolean = false;  
  userProfile:any;

  constructor(private fb: FormBuilder,    
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private direction: DirectionService,
    private router:Router) {
    this.stepTwo =this.fb.group({
      colour: [''],
      colourName: ['', Validators.required],
      colourImage: [null, Validators.required],
      productVideo: [null],
      productImages: this.fb.array([], Validators.required)
    })

    // this.createFormControls2()
    

    // set cdn path
    this.CloudPath = this.authService.cdnPath 
    
  }

  ngOnInit() {
    // call master    
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    // this.getAllSubCategory()      
    if (this.productId) {
      this.getProductDataById()
    }

  } 
  get f() {
    return this.stepTwo.get('stepOne') as FormGroup;
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
      this.productDetails = res;

      if (this.productDetails) {
        this.colourCollections = this.productDetails.colourCollections;
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      this.spinner.hide();
    }
  }


  // for Step two  =============================================================
  get productImages(): FormArray {
    return this.stepTwo.get('productImages') as FormArray;
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      if (controlName === 'productVideo' && file.size > 50 * 1024 * 1024) { // 50 MB in bytes
        this.videoSizeError = 'Product video must be less than 50 MB';
        this.stepTwo.get(controlName)?.reset();
      } else {
        this.videoSizeError = '';
        this.stepTwo.get(controlName)?.setValue(file);
      }
      this.cd.detectChanges();
    }
  }

  onProductImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productImages.push(this.fb.control(file));
      this.cd.detectChanges();
    }
  }

  removeProductImage(index: number) {
    this.productImages.removeAt(index);
    this.cd.detectChanges();
  }

  triggerFileInput() {
    const fileInput: HTMLElement = document.getElementById('productImageInput') as HTMLElement;
    fileInput.click();
  }

 
  async saveStepTwoData(type: any = '') {
    this.submittedStep2 = true;
    this.stepTwo.markAllAsTouched();
  
    // Check if colourCollections is empty and type is "add_go_next"
    if (type === 'add_go_next' && this.productDetails.colourCollections.length === 0) {
      this.communicationService.showNotification(
        'snackbar-error',
        'First add any collection then go to the next page',
        'bottom',
        'center'
      );
      return; // Stop the function execution if condition is met
    }
  
    if (this.stepTwo.valid && !this.videoSizeError) {
      try {
        const formData = await this.createFormData(); // Wait for createFormData to complete
        this.spinner.show();
        const response = await this.authService
          .post(`type2-products/upload/colour-collection/${this.productId}`, formData)
          .toPromise();
        if (response) {
          this.spinner.hide();
          this.resetForm();
          this.productDetails=response;
          this.colourCollections = response.colourCollections;
          this.communicationService.showNotification(
            'snackbar-success',
            'Saved Successfully...!!!',
            'bottom',
            'center'
          );
          this.updateValidators();       
        }
      } catch (error) {
        console.log('Error', error);
        this.spinner.hide();
      }
    } else {
      console.log('Form is invalid');
      this.spinner.hide();
    }
  }

  goToNextStep(){
    if(this.colourCollections.length >0){
      this.next.emit(this.productId)
    }
    else{
      this.communicationService.showNotification(
        'snackbar-error',
        'First add any collection then go to the next page',
        'bottom',
        'center'
      );
    }
   
  }
  

  navigateOnProduct(){
    this.router.navigateByUrl('mnf/manage-product')
  }


  createFormData(): Promise<FormData> {
    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('colour', this.stepTwo.get('colour')?.value);
        formData.append('colourName', this.stepTwo.get('colourName')?.value);
        const colourImage = this.stepTwo.get('colourImage')?.value;
        if (colourImage !== null) {
          formData.append('colourImage', colourImage);
        }
        const productVideo = this.stepTwo.get('productVideo')?.value;
        if (productVideo !== null) {
          formData.append('productVideo', productVideo);
        }
        const productImages = this.stepTwo.get('productImages') as FormArray;
        if (productImages && productImages.length > 0) {
          productImages.controls.forEach((control, index) => {
            const file = control.value;
            if (file) {
              formData.append('productImages', file);
            }
          });
        }
        resolve(formData); // Resolve with formData
      } catch (error) {
        reject(error); // Reject in case of any error
      }
    });
  }

  // for reset all form
  resetForm() {
    this.stepTwo.reset();
    this.productImages.clear();
    (document.getElementById('colourImage') as HTMLInputElement).value = '';
    (document.getElementById('videoUpload') as HTMLInputElement).value = '';
    this.submittedStep2 = false;
  }

  createObjectURL(file: File): string {
    return window.URL.createObjectURL(file);
  }

  setValidators(controlNames: string[]) {
    controlNames.forEach(controlName => {
      const control = this.stepTwo.get(controlName);
      if (control) {
        control.setValidators(Validators.required);
        control.updateValueAndValidity();
      }
    });
  }

  clearValidators(controlNames: string[]) {
    controlNames.forEach(controlName => {
      const control = this.stepTwo.get(controlName);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  updateValidators() {
    if (this.colourCollections.length === 0) {
      this.setValidators(['colourName', 'colourImage', 'productImages']);
    } else {
      this.clearValidators(['colourImage', 'productImages']);
      this.setValidators(['colourName', 'colour']);
    }
  }

  getProductImagePath(Image: any) {
    return this.CloudPath + Image;
  }

  getColorIconPath(Image: any) {
    return this.CloudPath + Image;
  }
  getVideoPath(video: any) {
    return this.CloudPath + video;
  }

  deleteColorCOllection(CollectionData:any) {
    const id = `?&id=${this.productId}&collectionId=${CollectionData._id}`
    this.spinner.show()
    this.authService.delete(`products/delete/colour-collection`, id).subscribe(res => {
      this.getProductDataById()
      this.spinner.hide()
      this.communicationService.showNotification('snackbar-success', `Deleted Successfully...!!!`, 'bottom', 'center');
    }, error => {
      this.spinner.hide()
    });
  }

  goToNextPage(){
    this.next.emit( this.productId);
  }

}
