import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-add-new-products',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor,
    NgIf,
    MultiSelectModule,
    FormsModule,
    DialogModule,
    NgClass,
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './add-new-products.component.html',
  styleUrls: ['./add-new-products.component.scss'],
  providers: [DatePipe]
})
export class AddNewProductsComponent {
  addProductForm: any = FormGroup;
  submittedStep2: boolean = false;
  submittedStep1 = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef; 
  CloudPath: string = ''
  ProductId:any;

  videoSizeError: string = '';
  userProfile: any

  productDetails:any

  // form step
  currentStep = 1;

  selectedSizes: any = []
  colourCollections: any = []
 

  // dropdown data
  sizes: any = [
    '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL',
    '4XL', '5XL', '6XL', '7XL', '8XL', 'Free'
  ];
  // allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
  allGender = ['Men', 'Women', 'Boys', 'Girl', 'Unisex'];
  allClothingType: any;
  allMaterialType: any;
  allFabricPattern: any;
  allOccasionType: any;
  allFitStyle: any
  allNeckStyle: any
  allClosureType: any;
  allPocketDiscription: any;
  allSleeveCutStyle: any;
  allSleeveLength: any;
  allSpecialFeature: any;
  allCareInstruction: any;
  allSubCategory: any;
  allLifeStyle: any
  allBrands: any
  allProductType:any

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route:ActivatedRoute,
    private datePipe: DatePipe) {
    this.addProductForm = this.fb.group({
      stepOne: this.fb.group({
        designNumber: ['', Validators.required],
        brand: ['', Validators.required],
        productType: ['', Validators.required],
        gender: ['', Validators.required],
        clothing: ['', Validators.required],
        subCategory: ['', Validators.required],
        productTitle: ['', Validators.required],        
        productDescription: ['', Validators.required],
        material: ['', Validators.required],
        materialvariety: [''],
        fabricPattern: ['', Validators.required],
        selectedOccasion: [[]],
        selectedlifeStyle: [[]],
        specialFeature: [[]],
        fitStyle: ['', Validators.required],
        neckStyle: ['', Validators.required],
        closureType: ['', Validators.required],
        pocketDescription: ['', Validators.required],
        sleeveCuffStyle: ['', Validators.required],
        sleeveLength: ['', Validators.required],
        careInstructions: [''],
        sizes: this.fb.array([]),
        ProductDeimension: this.fb.group({
          length: ['', Validators.required],
          width: ['', Validators.required],
          height: ['', Validators.required],
        }),
        netWeight: ['', Validators.required],
        MRP: ['', Validators.required],
        quantity: ['',[Validators.required]],
        dateOfManufacture: ['',[Validators.required]],
        dateOfListing: ['',[Validators.required]],
      }),
      stepTwo: this.fb.group({
        colour: [''],
        colourName: ['', Validators.required],
        colourImage: [null, Validators.required],
        productVideo: [null],
        productImages: this.fb.array([], Validators.required)
      })
    });

    this.CloudPath = this.authService.cdnPath

      // get product id from view
      this.route.queryParamMap.subscribe(params => {
        this.ProductId = params.get('id');
       });  

  }

  ngOnInit() {   
    // call master    
   this.getAllSubCategory()
    this.getMaterial()
    this.getFabricPttern()
    this.getOccasion()
    this.getFitStyle()
    this.getNeckStyle()
    this.getAllClosureType()
    this.getPocketDiscription()
    this.getSleeveCutStyle()
    this.getSleeveLength()
    this.getSpecialFeature()
    this.getallCareInstruction()
    this.getAllLifeStyle()
    this.getAllBrands()
    this.updateValidators()

    if(this.ProductId){
      this.getProductDataById()
    }

  }

  // stepOne vlidation
  get f() {
    return this.addProductForm.get('stepOne') as FormGroup;
  }


  
  getAllSubCategory() {
    const productType = this.stepOne.get('productType')?.value;
    const gender = this.stepOne.get('gender')?.value;
    const clothing = this.stepOne.get('clothing')?.value;
  
    let url = 'sub-category';
  
    if (productType) {
      url += `?productType=${productType}`;
    }
    if (gender) {
      url += (url.includes('?') ? '&' : '?') + `gender=${gender}`;
    }
    if (clothing) {
      url += (url.includes('?') ? '&' : '?') + `clothing=${clothing}`;
    }
  
    // Clear previous values
    this.allProductType = [];
    this.allClothingType = [];
    this.allSubCategory = [];
  
    this.authService.get(url).subscribe(res => {
      if (res) {
        this.allProductType = Array.from(new Set(res.results.map((item: any) => item.productType)));
        this.allClothingType = Array.from(new Set(res.results.map((item: any) => item.category)));
        this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
      }
    }, (error) => {
      console.log(error);
    });
  }
  

  getAllBrands() {
    this.authService.get('brand').subscribe(res => {
      if (res) {
        this.allBrands = res.results.map((item: any) => item.brandName);
      }

    },
      errpr => {
        console.log('error')
      })
  }

  getAllLifeStyle() {
    this.authService.get('lifestyle').subscribe(res => {
      if (res) {
        this.allLifeStyle = res.results.map((item: any) => item.name);
      }

    },
      errpr => {
        console.log('error')
      })
  }

  getMaterial() {
    this.authService.get('material').subscribe(res => {
      if (res) {
        this.allMaterialType = res.results
      }

    },
      errpr => {
        console.log('error')
      })
  }

  getFabricPttern() {
    this.authService.get('pattern').subscribe(res => {
      if (res) {
        this.allFabricPattern = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getOccasion() {
    this.authService.get('occasion').subscribe(
      res => {
        if (res && res.results) {
          this.allOccasionType = res.results.map((item: any) => item.name);
        }
      },
      error => {
        console.log('Error', error);
      }
    );
  }

  getFitStyle() {
    this.authService.get('fit-type').subscribe(res => {
      if (res) {
        this.allFitStyle = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getNeckStyle() {
    this.authService.get('neck-style').subscribe(res => {
      if (res) {
        this.allNeckStyle = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }


  getAllClosureType() {
    this.authService.get('closure-type').subscribe(res => {
      if (res) {
        this.allClosureType = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getPocketDiscription() {
    this.authService.get('pocket-discription').subscribe(res => {
      if (res) {
        this.allPocketDiscription = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getSleeveCutStyle() {
    this.authService.get('sleev-cut-style').subscribe(res => {
      if (res) {
        this.allSleeveCutStyle = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getSleeveLength() {
    this.authService.get('sleeve-length').subscribe(res => {
      if (res) {
        this.allSleeveLength = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  getSpecialFeature() {
    this.authService.get('special-feature').subscribe(res => {
      if (res) {
        this.allSpecialFeature = res.results.map((item: any) => item.name);
      }
    },
      errpr => {
        console.log('error')
      })
  }

  // getAllSubCategory() {
  //   this.authService.get(`sub-category`).subscribe(res => {
  //     if (res) {
  //       this.allSubCategory = res.results;
  //     }
  //   }, (error) => {
  //     console.log(error);
  //   });
  // }

  getallCareInstruction() {
    this.authService.get('care-instruction').subscribe(res => {
      if (res) {
        this.allCareInstruction = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

  // Form step functions
  nextStep() {
    if (this.currentStep === 1) {
      if(this.ProductId){
       this.UpdateStepOne()
      }
      else{
        this.saveStepOneData();
      }      
    } else if (this.currentStep === 2) {
      this.saveStepTwoData();
    }
  }

  // prevStep() {
  //   if (this.currentStep > 1) {
  //     this.currentStep--;
  //   }
  // }

  get stepOne() {
    return this.addProductForm.get('stepOne') as FormGroup;
  }

  get stepTwo() {
    return this.addProductForm.get('stepTwo') as FormGroup;
  }

  get sizesArray() {
    return this.stepOne.get('sizes') as FormArray;
  }

  onSizeChange(event: any, size: string) {
    if (event.target.checked) {
      this.sizesArray.push(this.fb.group({
        standardSize: size,
        brandSize: ['', Validators.required],
        chestSize: ['', Validators.required],
        shoulderSize: ['', Validators.required],
        frontLength: ['', Validators.required]
      }));
    } else {
      const index = this.sizesArray.controls.findIndex(x => x.get('size')?.value === size);
      this.sizesArray.removeAt(index);
    }
  }

  // save Forms step One
  saveStepOneData() {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.submittedStep1 = true
    if (this.stepOne.valid) {
      const productBy = this.userProfile.email
      // Add the createdBy property to stepOne's value
      const stepOneData = {
        ...this.stepOne.value,
        productBy: productBy
      };

      this.spinner.show()
      this.authService.post('products', stepOneData).subscribe(res => {
        if (res) {
          this.spinner.hide();
          this.ProductId = res.id
          this.communicationService.showNotification(
            'snackbar-success',
            `Saved Successfully...!!!`,
            'bottom',
            'center'
          );
          setTimeout(() => {
            this.currentStep++;
          }, 1500);

        }

      },
        errpr => {
          this.spinner.hide();
          console.log('error')
        })
    }
  }

  // for Step two
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

  async saveStepTwoData() {
    this.submittedStep2 = true;
    this.stepTwo.markAllAsTouched();
    if (this.stepTwo.valid && !this.videoSizeError) {
      try {
        const formData = await this.createFormData(); // Wait for createFormData to complete
        this.spinner.show();
        const response = await this.authService.post(`products/upload/colour-collection/${this.ProductId}`, formData).toPromise();
        if (response) {
          this.spinner.hide();
          this.resetForm();
          this.colourCollections = response.colourCollections;
          this.communicationService.showNotification(
            'snackbar-success',
            `Saved Successfully...!!!`,
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
    // Manually reset the file inputs
    (document.getElementById('colourImage') as HTMLInputElement).value = '';
    (document.getElementById('videoUpload') as HTMLInputElement).value = '';
    this.submittedStep2 = false;
  }

  createObjectURL(file: File): string {
    return window.URL.createObjectURL(file);
  }

 
  // for update validation
  setValidators(controlNames: string[]) {
    controlNames.forEach(controlName => {
      const control = this.stepTwo.get(controlName);
      if (control) {
        control.setValidators(Validators.required);
        control.updateValueAndValidity();
      }
    });
  }

  // Function to clear validators for specific controls
  clearValidators(controlNames: string[]) {
    controlNames.forEach(controlName => {
      const control = this.stepTwo.get(controlName);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }


  // Function to update validators based on the colourCollections length
  updateValidators() {
    if (this.colourCollections.length === 0) {
      this.setValidators(['colourName', 'colourImage', 'productImages']);
      // this.setValidatorsForFormArray(this.productImages);
    } else {
      this.clearValidators(['colourImage', 'productImages']);
      // this.clearValidatorsForFormArray(this.productImages);
      this.setValidators(['colourName', 'colour']);
    }
  }

  // create path for video and image
  getProductImagePath(Image: any) {
    return this.CloudPath+Image;
  }

  getColorIconPath(Image: any) {
    return this.CloudPath+Image;
  }
  getVideoPath(video: any) {
    return this.CloudPath+video;
  }


  // Update Product Details

  // Update Step first

  // patch product data
  getProductDataById(){
    this.spinner.show()
  this.authService.getById('products',this.ProductId).subscribe(res=>{
    this.productDetails=res;
    if(this.productDetails){
      if(this.currentStep == 2){
        this.colourCollections=this.productDetails.colourCollections
      }else{
    this.stepOne.patchValue(this.productDetails)
    const formattedDate1 = this.datePipe.transform(this.productDetails.dateOfManufacture, 'yyyy-MM-dd');
    const formattedDate2 = this.datePipe.transform(this.productDetails.dateOfListing, 'yyyy-MM-dd');
    this.stepOne.patchValue({
      dateOfManufacture: formattedDate1,
      dateOfListing:formattedDate2
      // other form controls
    });
     // Patch the nested ProductDimension form group
     this.stepOne.get('ProductDeimension')?.patchValue({
      length: this.productDetails.ProductDeimension[0].length,
      width: this.productDetails.ProductDeimension[0].width,
      height: this.productDetails.ProductDeimension[0].height,
    });
    // Handle patching the sizes array
    this.patchSizesArray(this.productDetails.sizes);
    }  
  }
  this.spinner.hide()
  },error=>{
    this.spinner.hide()
  })
  }

  onEditFormData(data: any) {
    const formattedDate = this.datePipe.transform(data.dateOfManufacture, 'yyyy-MM-dd');
    this.stepOne.patchValue({
      quantity: data.quantity,
      dateOfManufacture: formattedDate,
      // other form controls
    });
  }

  patchSizesArray(sizes: any[]) {
    const sizesArray = this.addProductForm.get('stepOne.sizes') as FormArray;
    sizesArray.clear(); // Clear existing values
    this.selectedSizes = [];

    sizes.forEach(size => {
      sizesArray.push(this.fb.group({
        standardSize: [size.standardSize],
        brandSize: [size.brandSize, Validators.required],
        chestSize: [size.chestSize, Validators.required],
        shoulderSize: [size.shoulderSize, Validators.required],
        frontLength: [size.frontLength, Validators.required]
      }));
      this.selectedSizes.push(size.standardSize); // Keep track of selected sizes
    });
  }

  UpdateStepOne(){
    if(this.stepOne.invalid){
      return;
    }
    else{
    this.spinner.show()
    this.authService.patchWithEmail(`products/${this.ProductId}`,this.stepOne.value).subscribe(res=>{
      if(res){
        this.colourCollections=res.colourCollections
        this.spinner.hide()
        
        this.communicationService.showNotification(
          'snackbar-success',
          `Saved Successfully...!!!`,
          'bottom',
          'center'
        );
        setTimeout(() => {
          this.currentStep++;
        }, 1500);
      }

    },
    error=>{
      console.log('error')
    }
  )
  }
}

deleteColorCOllection(CollectionData: any){
 const id=`?&id=${this.ProductId}&collectionId=${CollectionData._id}`
 this.spinner.show()
  this.authService.delete(`products/delete/colour-collection`,id).subscribe(res=>{
    this.getProductDataById()
    this.spinner.hide()
    this.communicationService.showNotification(
      'snackbar-success',
      `Deleted Successfully...!!!`,
      'bottom',
      'center'
    );
  },error=>{
    this.spinner.hide()
  }
)
}

}


