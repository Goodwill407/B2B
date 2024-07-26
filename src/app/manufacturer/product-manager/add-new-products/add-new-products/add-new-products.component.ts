import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  styleUrls: ['./add-new-products.component.scss']
})
export class AddNewProductsComponent {
  addProductForm: FormGroup;
  submitted: boolean = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  ProductId: any
  CloudPath: string = 'https://lmscontent-cdn.blr1.digitaloceanspaces.com'

  videoSizeError: string = '';

  // form step
  currentStep =1;

  selectedSizes: any = []
  colourCollections: any;

  // dropdown data
  sizes: any = [
    '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL',
    '4XL', '5XL', '6XL', '7XL', '8XL', 'Free'
  ];
  allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
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
  allLifeStyle:any 

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService) {
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
        selectedOccasion: [[], Validators.required],
        selectedlifeStyle: [[], Validators.required],
        specialFeature: [[], Validators.required],
        fitStyle: ['', Validators.required],
        neckStyle: ['', Validators.required],
        closureType: ['', Validators.required],
        pocketDescription: ['', Validators.required],
        sleeveCuffStyle: ['', Validators.required],
        sleeveLength: ['', Validators.required],
        careInstructions: ['', Validators.required],
        sizes: this.fb.array([]),
        ProductDeimension: this.fb.group({
          length: ['', Validators.required],
          width: ['', Validators.required],
          height: ['', Validators.required],
        }),
        netWeight: ['', Validators.required],
        MRP: ['', Validators.required],
      }),
      stepTwo: this.fb.group({
        colour: [''],
        colourName: ['', Validators.required],
        colourImage: [null, Validators.required],
        productVideo: [null, Validators.required],
        productImages: this.fb.array([])
      })
    });
  }

  ngOnInit() {
    // call master
    this.getProductDataById()
    this.getClothingType()
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
    this.getAllSubCategory()
    this.getAllLifeStyle()
  }

  // stepOne vlidation
  get f() {
    return this.addProductForm.get('stepOne') as FormGroup;
  }

  // all Masters Data
  getClothingType() {
    this.authService.get('clothing-mens').subscribe(res => {
      if (res) {
        this.allClothingType = res.results
      }

    },
      errpr => {
        console.log('error')
      })
  }

  getAllLifeStyle(){
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

  getAllSubCategory() {
    this.authService.get('sub-category').subscribe(res => {
      if (res) {
        this.allSubCategory = res.results
      }
    },
      errpr => {
        console.log('error')
      })
  }

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
      this.saveStepOneData();
    } else if (this.currentStep === 2) {
      this.saveStepTwoData();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

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
        size: size,
        brandSize: [''],
        chest: [''],
        shoulder: [''],
        frontLength: ['']
      }));
    } else {
      const index = this.sizesArray.controls.findIndex(x => x.get('size')?.value === size);
      this.sizesArray.removeAt(index);
    }
  }

  // save Forms step One
  saveStepOneData() {
    if (this.stepOne.valid) {
      this.spinner.show()
      this.authService.post('products', this.stepOne.value).subscribe(res => {
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
      if (controlName === 'productVideo' && file.size > 10 * 1024 * 1024) { // 10 MB in bytes
        this.videoSizeError = 'Product video must be less than 10 MB';
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
      this.productImages.push(this.fb.control(file, Validators.required));
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

  saveStepTwoData() {
    this.stepTwo.markAllAsTouched();
    if (this.stepTwo.valid && !this.videoSizeError) {
      const formData = this.createFormData();
      this.spinner.show();
      this.authService.post(`products/upload/colour-collection/${this.ProductId}`, formData).subscribe(
        response => {
          if (response) {
            this.spinner.hide();

            this.resetForm()
            this.colourCollections = response.colourCollections
            this.communicationService.showNotification(
              'snackbar-success',
              `Saved Successfully...!!!`,
              'bottom',
              'center'
            );
          }
        },
        error => {
          console.log('Error', error);
          this.spinner.hide();
        }
      );
    } else {
      console.log('Form is invalid');
      this.spinner.hide();
    }
  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('colour', this.stepTwo.get('colour')?.value);
    formData.append('colourName', this.stepTwo.get('colourName')?.value);
    formData.append('colourImage', this.stepTwo.get('colourImage')?.value);
    formData.append('productVideo', this.stepTwo.get('productVideo')?.value);
    // formData.append('productImages', this.stepTwo.get('productImages')?.value);

    this.productImages.controls.forEach((control, index) => {
      formData.append(`productImages`, control.value);
    });

    return formData;
  }

  // for reset all form
  resetForm() {
    this.stepTwo.reset();
    this.productImages.clear();
    // Manually reset the file inputs
    (document.getElementById('colourImage') as HTMLInputElement).value = '';
    (document.getElementById('videoUpload') as HTMLInputElement).value = '';
  }

  createObjectURL(file: File): string {
    return window.URL.createObjectURL(file);
  }

  // get data from Backend
  getProductDataById() {
    this.authService.get('products').subscribe(res => {
      console.log(res)
    })

  }


}


