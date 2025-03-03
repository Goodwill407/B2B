import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService, DirectionService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { timeout } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-step-two',
  standalone: true,
  imports: [
    ReactiveFormsModule, NgIf, NgClass, NgFor, MultiSelectModule, FormsModule, DialogModule, CommonModule, NgxSpinnerModule
  ],
  templateUrl: './step-two.component.html',
  styleUrl: './step-two.component.scss',
  providers: [DatePipe]
})
export class StepTwoComponent {
  @Input() productId: any;
  @Output() next = new EventEmitter<any>();
  stepTwo: FormGroup;
  submittedStep2: boolean = false;
  submittedStep1: boolean = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  showFlag2: boolean = false;
  videoSizeError: string = '';
  productDetails: any;
  colourCollections: any = [];
  locationData: any;
  showFlag: boolean = false;
  userProfile: any;
  uploadInProgress: boolean = false;
  uploadProgress: number = 0;
  uploadSpeed: string = '0';
  isUploading: boolean = false;
  productName: string = '';
  productPrice: number = 0;
  expiryDate: Date | null = null;
  productDescription: string = '';
  category: string = '';
  isActive: boolean = true;
  productTitle:any;
  designNumber:any;

  constructor(
    private httpClient: HttpClient,
    private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private direction: DirectionService,
    private router: Router
  ) {
    this.stepTwo = this.fb.group({
      colour: [''],
      colourName: ['', Validators.required],
      colourImage: [null, Validators.required],
      productVideo: [null],
      productImages: this.fb.array([], Validators.required)
    });
  }

  ngOnInit() {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    if (this.productId) this.getProductDataById();
  }

  get f() {
    return this.stepTwo.get('stepOne') as FormGroup;
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
      this.productDetails = res;
      console.log(this.productDetails);
      this.productTitle = res.productTitle ;
      this.designNumber = res.designNumber;
      if (this.productDetails) this.colourCollections = this.productDetails.colourCollections;
    } catch (error) {
      console.error('Error fetching product data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  get productImages(): FormArray {
    return this.stepTwo.get('productImages') as FormArray;
  }

  onFileChange(event: any, controlName: string) {
    const file = event.target.files[0];
    if (file) {
      if (controlName === 'productVideo' && file.size > 50 * 1024 * 1024) {
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
      // Check if the file already exists in the array (duplicate check)
      const isDuplicate = this.productImages.controls.some((control) => {
        const existingFile = control.value;
        return existingFile.name === file.name && existingFile.size === file.size;
      });
  
      if (isDuplicate) {
        Swal.fire({
          icon: 'error',
          title: 'Duplicate Image',
          text: 'This image has already been added. Please select a different image.',
        });
        return; // Prevent adding the duplicate image
      }
  
      // Add the file to the FormArray if it is not a duplicate
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
    if (type === 'add_go_next' && this.productDetails.colourCollections.length === 0) {
      this.communicationService.showNotification('snackbar-error', 'First add any collection then go to the next page', 'bottom', 'center');
      return;
    }
    if (this.stepTwo.valid && !this.videoSizeError) {
      try {
        const formData = await this.createFormData();
        this.spinner.show();
        const response = await this.authService.post(`type2-products/upload/colour-collection/${this.productId}`, formData).toPromise();
        if (response) {
          this.spinner.hide();
          this.resetForm();
          this.productDetails = response;
          this.colourCollections = response.colourCollections;
          this.updateValidators();
          this.getProductDataById();
        }
      } catch (error) {
        console.log('Error', error);
        this.spinner.hide();
        this.getProductDataById();
      }
    } else {
      console.log('Form is invalid');
      this.spinner.hide();
      this.getProductDataById();
    }
  }

  // goToNextStep() {
  //   if (this.colourCollections.length > 0) this.next.emit(this.productId);
  //   else this.communicationService.showNotification('snackbar-error', 'First add any collection then go to the next page', 'bottom', 'center');
  // }

  // This method skips the step 3 & 4 and directly create product as we dont have to take min and max Quantity
  goToNextStep() {  
    if (this.colourCollections.length > 0){
      this.navigateOnProduct();
    } 
    else this.communicationService.showNotification('snackbar-error', 'First add any collection then go to the next page', 'bottom', 'center');
  }

  navigateOnProduct() {
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

  createFormData(): Promise<FormData> {
    return new Promise((resolve, reject) => {
      try {
        const formData = new FormData();
        formData.append('colour', this.stepTwo.get('colour')?.value);
        formData.append('colourName', this.stepTwo.get('colourName')?.value);
        const colourImage = this.stepTwo.get('colourImage')?.value;
        if (colourImage !== null) formData.append('colourImage', colourImage);
        const productVideo = this.stepTwo.get('productVideo')?.value;
        if (productVideo !== null) formData.append('productVideo', productVideo);
        const productImages = this.stepTwo.get('productImages') as FormArray;
        if (productImages && productImages.length > 0) {
          productImages.controls.forEach((control, index) => {
            const file = control.value;
            if (file) formData.append('productImages', file);
          });
        }
        resolve(formData);
        this.getProductDataById();
      } catch (error) {
        reject(error);
      }
    });
  }

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
    if (this.colourCollections.length === 0) this.setValidators(['colourName', 'colourImage', 'productImages']);
    else {
      this.clearValidators(['colourImage', 'productImages']);
      this.setValidators(['colourName', 'colour']);
    }
  }

  getProductImagePath(Image: any) {
    return Image;
  }

  getColorIconPath(Image: any) {
    return Image;
  }

  getVideoPath(video: any): string {
    return video ? video : '';
  }

  deleteColorCollection(CollectionData: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this color collection? This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        const queryParams = `id=${this.productId}&collectionId=${CollectionData._id}`;
        this.spinner.show();
        const apiUrl = `type2-products/delete/colour-collection?${queryParams}`;
        this.authService.delete2(apiUrl).subscribe(
          (res) => {
            this.getProductDataById();
            this.spinner.hide();
            Swal.fire('Deleted!', 'Your color collection has been deleted.', 'success');
          },
          (error) => {
            this.spinner.hide();
            console.error('Error during deletion:', error);
            Swal.fire('Error!', 'An error occurred while deleting the color collection.', 'error');
          }
        );
      }
    });
  }

  goToNextPage() {
    this.next.emit(this.productId);
  }

  uploadDefaultVideo(event: any, collectionId: string) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      this.videoSizeError = 'Product video must be less than 50 MB';
      return;
    }
    const formData = new FormData();
    formData.append('productVideo', file);
    const patchUrl = `/type2-products/add-product/video/colour-collection?id=${this.productId}&collectionId=${collectionId}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.token}`);
    const uploadReq = new HttpRequest('PATCH', this.authService.apiURL + patchUrl, formData, {
      headers: headers,
      reportProgress: true,
      responseType: 'json',
    });
    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSpeed = '0';
    const startTime = Date.now();
    let lastLoaded = 0;
    this.httpClient.request(uploadReq).pipe(timeout(60000)).subscribe(
      (event: any) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.uploadProgress = Math.round((100 * event.loaded) / event.total);
              const now = Date.now();
              const durationInSec = (now - startTime) / 1000;
              const bytesPerSec = (event.loaded - lastLoaded) / durationInSec;
              this.uploadSpeed = (bytesPerSec / 1024).toFixed(2);
              lastLoaded = event.loaded;
            }
            break;
          case HttpEventType.Response:
            this.isUploading = false;
            if (event.body) {
              this.getProductDataById();
              Swal.fire('Updated!', 'Product video has been uploaded successfully.', 'success');
            }
            break;
          default:
            break;
        }
      },
      (error) => {
        this.isUploading = false;
        console.error('Error uploading video:', error);
        Swal.fire('Error!', 'Failed to upload product video.', 'error');
      }
    );
  }

  playVideo(videoPath: string): void {
    Swal.fire({
      title: 'Video',
      html: `<video width="100%" controls autoplay>
               <source src="${videoPath}" type="video/mp4">
               Your browser does not support the video tag.
             </video>`,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: 'Close',
    });
  }

  deleteVideo(collectionId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this video. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const queryParams = `id=${this.productId}&collectionId=${collectionId}`;
        const apiUrl = `/type2-products/delete/colour-collection/product-video?${queryParams}`;
  
        this.spinner.show(); // Show loading spinner
        this.authService.delete2(apiUrl).subscribe(
          (response) => {
            this.getProductDataById(); // Refresh the product data
            this.spinner.hide(); // Hide loading spinner
            Swal.fire('Deleted!', 'Your product video has been deleted.', 'success'); // Show success message
          },
          (error) => {
            this.spinner.hide(); // Hide loading spinner
            console.error('Error during deletion:', error);
            Swal.fire('Error!', 'There was an error deleting the product video.', 'error'); // Show error message
          }
        );
      }
    });
  }
  async convertImageUrlToFile(imageUrl: string, fileName: string): Promise<File> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      return file;
    } catch (error) {
      console.error('Error converting URL to File:', error);
      throw new Error('Error fetching image from URL');
    }
  }
  
  
  
}