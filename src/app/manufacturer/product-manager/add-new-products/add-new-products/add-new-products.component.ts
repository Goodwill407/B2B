import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@core';
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
    CommonModule
  ],
  templateUrl: './add-new-products.component.html',
  styleUrls: ['./add-new-products.component.scss']
})
export class AddNewProductsComponent {
  addProductForm: FormGroup;
  submitted: boolean = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: any; 
  @ViewChild('fileInput') fileInput: any;
  objectId:any;

  // form step
  currentStep = 1;

  selectedSizes: any = []

  // dropdown data
  sizes: any = [
    '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL',
    '4XL', '5XL', '6XL', '7XL', '8XL', 'Free'
  ];
  allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
  allGender = ['Men', 'Women', 'Boys', 'Girl', 'Unisex'];
  allClothingType:any;
  allMaterialType:any;
  allFabricPattern:any;
  allOccasionType:any;
  allFitStyle:any
  allNeckStyle:any
  allClosureType:any;
  allPocketDiscription:any;
  allSleeveCutStyle:any;
  allSleeveLength:any;
  allSpecialFeature:any;
  allCareInstruction:any;
  allSubCategory = ['tees'];
  demo = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
  ];
  allBrand: any;

  constructor(private fb: FormBuilder,private authService:AuthService)
   {
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
        colorCollection: this.fb.array([this.createColorGroup()])
      })
    });
  }

  ngOnInit() {
    // call master
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
   this.getallCareInstruction();
   this.getAllBrands();
  }

  // stepOne vlidation
  get f() {
    return this.addProductForm.get('stepOne') as FormGroup;
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

  get colorCollection(): FormArray {
    return this.stepTwo.get('colorCollection') as FormArray;
  }

  createColorGroup(): FormGroup {
    return this.fb.group({
      colour: [''],
      colourName: [''],
      colourImage: [''],
      productVideo:[''],
      productImages: this.fb.array([])
    });
  }

  addColorGroup() {
    this.colorCollection.push(this.createColorGroup());
  }

  removeColorGroup(index: number) {
    this.colorCollection.removeAt(index);
  }

  getFormArray(group: AbstractControl, key: string): FormArray {
    return group.get(key) as FormArray;
  }

  triggerFileInput(colorIndex: number) {
    this.addProductImageGroup(colorIndex);
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: any, controlName: string, colorIndex: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const productImagesArray = this.getFormArray(this.colorCollection.at(colorIndex), 'productImages') as FormArray;
        const imageIndex = productImagesArray.length - 1;
        productImagesArray.at(imageIndex).setValue(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  addProductImageGroup(colorIndex: number) {
    const productImagesArray = this.getFormArray(this.colorCollection.at(colorIndex), 'productImages') as FormArray;
    productImagesArray.push(this.fb.control(''));
  }

  removeProductImageGroup(colorIndex: number, imageIndex: number) {
    const productImagesArray = this.getFormArray(this.colorCollection.at(colorIndex), 'productImages') as FormArray;
    productImagesArray.removeAt(imageIndex);
  }

  showProductImageDialog(colorIndex: number) {
    this.selectedColorGroupIndex = colorIndex;
    this.displayProductImageDialog = true;
  }

  // for remove dilog()
  saveProductImages(){
    this.displayProductImageDialog=false;
  }

  // all Masters Data
  getClothingType(){
      this.authService.get('clothing-mens').subscribe(res=>{
        if(res){
          this.allClothingType=res.results
        }

      },
    errpr=>{
      console.log('error')
    })
  }

  getMaterial(){
    this.authService.get('material').subscribe(res=>{
      if(res){
        this.allMaterialType=res.results
      }

    },
  errpr=>{
    console.log('error')
  })
}

getFabricPttern(){
  this.authService.get('pattern').subscribe(res=>{
    if(res){
      this.allFabricPattern=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getOccasion(){
  this.authService.get('Occasion').subscribe(res=>{
    if(res){
      this.allOccasionType=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getFitStyle(){
  this.authService.get('fit-type').subscribe(res=>{
    if(res){
      this.allFitStyle=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getNeckStyle(){
  this.authService.get('neck-style').subscribe(res=>{
    if(res){
      this.allNeckStyle=res.results
    }
  },
errpr=>{
  console.log('error')
})
}


getAllClosureType(){
  this.authService.get('closure-type').subscribe(res=>{
    if(res){
      this.allClosureType=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getPocketDiscription(){
  this.authService.get('pocket-discription').subscribe(res=>{
    if(res){
      this.allPocketDiscription=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getSleeveCutStyle(){
  this.authService.get('sleeve-cut-style').subscribe(res=>{
    if(res){
      this.allSleeveCutStyle=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getSleeveLength(){
  this.authService.get('sleeve-length').subscribe(res=>{
    if(res){
      this.allSleeveLength=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getSpecialFeature(){
  this.authService.get('special-feature').subscribe(res=>{
    if(res){
      this.allSpecialFeature=res.results
    }
  },
errpr=>{
  console.log('error')
})
}

getallCareInstruction(){
  this.authService.get('care-instruction').subscribe(res=>{
    if(res){
      this.allCareInstruction=res.results
    }
  },
errpr=>{
  console.log('error')
})
}


  // save Forms Data
  saveStepOneData() {
    if (this.stepOne.valid) {
      console.log('Step One Data:', this.stepOne.value);
      this.authService.post('products',this.stepOne.value).subscribe(res=>{
        if(res){
          this.currentStep++;
        }

      },
    errpr=>{
      console.log('error')
    })        
    } 
  }

  saveStepTwoData() {
    if (this.stepTwo.valid) {
      const formData = this.stepTwo.value;
      this.authService.post(`products/upload/colour-collection/${this.objectId}`,formData).subscribe(res=>{

      },
    error=>{
      console.log('error')
    })
      
    }
  }

  getAllBrands() {
    this.authService.get(`brand?page=1`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }
}
