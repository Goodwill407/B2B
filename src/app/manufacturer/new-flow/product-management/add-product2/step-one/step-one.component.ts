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
import { catchError, of } from 'rxjs';
import Swal from 'sweetalert2';  // Import SweetAlert2

@Component({
  selector: 'app-step-one',
  standalone: true,
  imports: [
    ReactiveFormsModule,   
    MultiSelectModule,
    FormsModule,
    DialogModule,  
    CommonModule,
    NgxSpinnerModule,
    DropdownModule,
    CommonModule],
  templateUrl: './step-one.component.html',
  styleUrl: './step-one.component.scss',
  providers: [DatePipe]
})
export class StepOneComponent {
  @Input() productId: any  // Allow nullable type
  @Output() next = new EventEmitter<any>(); 

  stepOne:FormGroup;
  submittedStep2: boolean = false;
  submittedStep1 = false;
  displayProductImageDialog: boolean = false;
  selectedColorGroupIndex: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  sizeSet: any
  sizeChart: any;
  sizeChartdata:any[]=[]
  foundSizeSet: any
  sizeChartFields: any[] = [];
  showFlag2: boolean = false;

  videoSizeError: string = '';
  userProfile: any
  brandErrorMessage: string = '';
  productDetails: any

  // form step
  currentStep = 1;

  selectedSizes: any = []
  colourCollections: any = []

  currencies: any = {}
  // currencyOptions = Object.values(this.currencies);
  selectedCurrency = 'INR'

  amount: number | null = null;
  // allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
  allGender:any=[]
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
  allSeasons: any;
  allSubCategory: any;
  allLifeStyle: any
  allBrands: any
  allProductType: any
  locationData: any;
  showFlag: boolean = false;
  visibleFields: any = []
  layerCompression:any
  allLayerCompression:any;
  Waistband:any;
  allWaistband:any;
  allTopstyle: any = []
  allEmbellishmentfeature: any = []
  allNoofpockets: any = []
  allCoinpocket: any = []
  allWaistsizeset: any = []
  allTrouserfittype: any = []
  allRisestyle: any = []
  allTrouserstyle: any = []
  allTrouserpocket: any = []
  includedComponents:any;
  // for womens dropdown master
  allWomensleevetype: any = []
  AllfitType:any=[]
  Allneckline:any=[]
  Allelasticity:any=[]  
  AllworkType:any=[]
  Allcollarstyle:any=[]   
  AllwaistType:any=[]
  AllwaistRise:any=[]
  AllweaveType:any=[]
  AllethnicDesign:any=[]
  AllsareeStyle:any=[]
  AllapparelSilhouette:any=[]  
  AllethnicBottomsStyle:any=[]
  AllwomenStyle:any=[]  
  AllfinishType:any=[]
  AllitemStyle:any=[]
  Allsocksstyle:any=[]
  allTrourserPocket:any=[];
  allIncludedComponent:any=[];  
  allItemLength:any=[];
  constructor(private fb: FormBuilder,    
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private direction: DirectionService,
    private router:Router) {
    this.stepOne = this.fb.group({
      
        designNumber: ['', Validators.required],
        brand: ['', Validators.required],
        productTitle: ['', Validators.required],
        productDescription: ['', Validators.required],
        productType: ['', Validators.required],
        gender: ['', Validators.required],
        clothing: ['', Validators.required],
        subCategory: ['', Validators.required],      

        sizes: this.fb.array([]),        

        dateOfManufacture: ['', [Validators.required]],
        dateOfListing: ['', [Validators.required]],
      }),

    // set cdn path
    

    // get product id from view
    this.route.queryParamMap.subscribe(params => {
      this.productId = params.get('id');
    }); 

  }

  ngOnInit() {
    // call master    
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    // this.getAllSubCategory()   
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
    this.getAllSeasons()
    this.getAllLifeStyle()
    this.getAllBrands()
    this.getAllCurrencyCode()
    // this.updateValidators()
    // this.disbledFields()
    this.getAllLayerCompression();
    this.getAllWaistband();

    this.getProfileData();
    this.getProductType();
    this.getTrouserstyle();
    this.getTrouserpocket();
    this.getWomensleevetype()
    this.getTopstyle()
    this.getNoofpockets()
    this.getEmbellishmentfeature()
    this.getCoinpocket()
    this.getTrouserfittype()
    this.getCoinpocket()
    // this.getTrouserpocket()
    this.getTrouserstyle()
    this.getRisestyle()
    this.getAllSocksStyle()
    this.getAllTrourserPocket()
    this.getAllIncludedComponent()   
    this.getAllCollarStyle()
    this.getAllWomenStyle()
    this.getAllFinishType()
    this.getAllEthnicBottomsStyle()
    this.getAllApparelSilhouette()
    this.getAllSareeStyle()
    this.getAllEthnicDesign()
    this.getAllWeaveType()
    this.getAllWaistType() 
    this.getallItemLength()
    this.getAllWorkType()
    this.getAllelasticity()
    if (this.productId) {
      this.getProductDataById()
    }
    
  } 
  // stepOne vlidation
  get f() {
    return this.stepOne.controls
  }

  submit(){
    if(this.productId){
      this.UpdateStepOne()
      
    }
    else{
      this.saveStepOneData()
    }

  }

  createFormControls(fields: string[]): void {
    fields.forEach(field => {
      // Define initial value and validators for each field if needed
      const initialValue = '';
      const validators = [];

      // Example: Adding required validator for some fields
      if (['material'].includes(field)) {
        validators.push(Validators.required);
      }

      // Add the control to the form group
      this.stepOne.addControl(field, this.fb.control(initialValue, validators));
    });
  }

  getSizeChartFields() {

    if (this.foundSizeSet === 'Size Set') {
      // this.sizeChartFields = []     
      this.sizeChartFields = [
        { name: 'standardSize', label: 'Standard Size', required: false, type: 'Item_size'},
        { name: 'brandSize', label: 'Brand Size', required: true, type: 'Item_size'},
        { name: 'chestSize', label: 'Chest Size (in cm)', required: true, type: 'Item_size',pattern: /^\d+$/ },
        { name: 'shoulderSize', label: 'Shoulder Size (in cm)', required: true, type: 'Item_size',pattern: /^\d+$/ },
        { name: 'frontLength', label: 'Front Length (in cm)', required: true, type: 'Item_size',pattern: /^\d+$/ },
        { name: 'neckSize', label: 'Neck Size (in cm)', required: true, type: 'Item_size' ,pattern: /^\d+$/},
        // { name: 'length', label: 'Length (in cm)', required: false, type: 'item_dimention' },
        // { name: 'width', label: 'Width (in cm)', required: false, type: 'item_dimention' },
        // { name: 'height', label: 'Height (in cm)', required: true, type: 'item_dimention' },
        // { name: 'weight', label: 'Weight (in gm)', required: true, type: 'item_dimention' },
        { name: 'manufacturerPrice', label: 'Wholesaler Price', required: true, type: 'price', pattern: /\d+(\.\d{1,2})?/ },
        { name: 'RtlPrice', label: 'Retailer Price', required: true, type: 'price', pattern: /\d+(\.\d{1,2})?/ },
        { name: 'singleMRP', label: 'MRP', required: true, type: 'price' , pattern:/\d+(\.\d{1,2})?/ },
    ];
    
    }
    else if (this.foundSizeSet === "Waist Size Set") {
      // this.sizeChartFields = []
      this.sizeChartFields = [
        { name: 'standardSize', label: 'Standard Size', required: false, type: 'Item_size' },
        { name: 'brandSize', label: 'Brand Size', required: true, type: 'Item_size' },
        { name: 'waistSizeSetStandardSize', label: 'Waist Size Set', required: false, type: 'Item_size' , pattern: /^\d+$/ },
        { name: 'waist', label: 'Waist(in cm)', required: true, type: 'Item_size', pattern: /^\d+$/ },
        { name: 'inseam', label: 'Inseam(in cm)', required: true, type: 'Item_size' , pattern: /^\d+$/ },
        { name: 'lengthIn', label: 'Length(in cm)', required: true, type: 'Item_size' , pattern: /^\d+$/ },
        { name: 'rise', label: 'Rise(in cm)', required: true, type: 'Item_size', pattern: /^\d+$/ },
        // { name: 'length', label: 'Length(in cm)', required: false, type: 'item_dimention' },
        // { name: 'width', label: 'Width(in cm)', required: false, type: 'item_dimention' },
        // { name: 'height', label: 'Height(in cm)', required: true, type: 'item_dimention' },
        // { name: 'weight', label: 'Weight(in Gm)', required: true, type: 'item_dimention' },
        { name: 'manufacturerPrice', label: 'Wholesaler Price', required: true, type: 'price', pattern: /\d+(\.\d{1,2})?/ },
        { name: 'RtlPrice', label: 'Retailer Price', required: true, type: 'price', pattern: /\d+(\.\d{1,2})?/ },
        { name: 'singleMRP', label: 'MRP', required: true, type: 'price', pattern: /\d+(\.\d{1,2})?/ }
    ];
    
    }
  }

  // Called when a size checkbox is checked/unchecked
  onSizeChange(event: any, size: number) {
    const sizesArray = this.stepOne.get('sizes') as FormArray;

    if (event.target.checked) {
      this.selectedSizes.push(size);
      sizesArray.push(this.createSizeFormGroup(size));  // Add new form group for the selected size
    } else {
      const index = this.selectedSizes.indexOf(size);
      this.selectedSizes.splice(index, 1);
      sizesArray.removeAt(index);  // Remove form group for the deselected size
    }
  }


  // Create a new FormGroup for each selected size
  createSizeFormGroup(size: number): FormGroup {
    const group = this.fb.group({
      standardSize: [size],  // Always include standardSize
    });

    // Dynamically add controls for each field from the backend
    this.sizeChartFields.forEach((field: any) => {
      group.addControl(field.name, this.fb.control('', field.required ? Validators.required : null));

      // Subscribe to changes for manufacturerPrice, singleMRP, and weight to trigger updateTotals
      // if (['manufacturerPrice', 'singleMRP', 'weight'].includes(field.name)) {
      //   group.get(field.name)?.valueChanges.subscribe(() => {
      //     // this.updateTotals();
      //   });
      // }
    });

    return group;
  }



  // For easier access to formArray controls
  get sizesArray(): FormArray {
    return this.stepOne.get('sizes') as FormArray;
  }

  getProfileData() {
    this.authService.get(`manufacturers/${this.userProfile.email}`).subscribe((res: any) => {
      this.locationData = res;
    });
  }


  getProductType() {
    this.authService.get(`producttype`).subscribe((res: any) => {
      this.allProductType = res.results;  
      if(this.productId)  {        
        this.getAllGender()
      }  
    });
  }

  OnProductTypeChange(){
    // Clear data
    (this.stepOne.get('sizes') as FormArray).clear();
    this.visibleFields = [];
    this.showFlag2 = false;
    this.selectedSizes = [];
    this.sizeChartFields = [];
    this.sizeSet = [];
    
  }

  async getCategoryByProductTypeAndGender(productType?: any, gender?: any) {
    const ProductType = this.stepOne.get('productType')?.value || productType;
    const Gender = this.stepOne.get('gender')?.value || gender;

    if (ProductType && Gender) {
      try {
        const res: any = await this.authService.get(`sub-category/get-category/by-gender?productType=${ProductType}&gender=${Gender}`).toPromise();
        if (res && res.results) {
          // for clear          
          this.allSubCategory = [];
          // Clear data
         (this.stepOne.get('sizes') as FormArray).clear();
         this.visibleFields = [];
         this.showFlag2 = false;
         this.selectedSizes = [];
         this.sizeChartFields = [];
         this.sizeSet = [];
          if (!this.productId) {
            this.stepOne.get('subCategory')?.patchValue('');
            this.stepOne.get('clothing')?.patchValue('');
          }
          this.allClothingType = Array.from(new Set(res.results.map((item: any) => item.category)));
        } else {
          this.allClothingType = [];
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      this.checkAllFieldsSelected();
    } else {
      console.warn('ProductType or Gender is not defined');
      this.allClothingType = [];
    }
  }

  async getSubCategoryBYProductType_Gender_and_Category(ProductType?: any, Gender?: any, Clothing?: any) {
    const productType = this.stepOne.get('productType')?.value || ProductType;
    const gender = this.stepOne.get('gender')?.value || Gender;
    const clothing = this.stepOne.get('clothing')?.value || Clothing;
    const object = {
      productType,
      gender,
      category: clothing,
    };

    try {
      const res: any = await this.authService.post(`sub-category/filter`, object).toPromise();
      if (res) {
        (this.stepOne.get('sizes') as FormArray).clear();
        this.allSubCategory = [];
        if (!this.productId) {
          this.stepOne.get('subCategory')?.patchValue('');
        }            
        // Clear data
      (this.stepOne.get('sizes') as FormArray).clear();
      this.visibleFields = [];
      this.showFlag2 = false;
      this.selectedSizes = [];
      this.sizeChartFields = [];
      this.sizeSet = [];
      }
      this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory)));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }

    this.checkAllFieldsSelected();
  }
  checkAllFieldsSelected() {
    const productType = this.stepOne.get('productType')?.value;
    const gender = this.stepOne.get('gender')?.value;
    const clothing = this.stepOne.get('clothing')?.value;
    const subCategory = this.stepOne.get('subCategory')?.value;
    if (productType && gender && clothing && subCategory) {
      this.mappingData(productType, gender, clothing, subCategory);
    }
    this.showFlag = !!(productType && gender && clothing && subCategory);
  }


  async mappingData(pType: any, gen: any, cat: any, sCat: any) {
    const object = {
      productType: pType,
      gender: gen,
      category: cat,
      subCategory: sCat
    };

    try {
      const res: any = await this.authService.post(`mapping/filter-subcategory`, object).toPromise();

      // Clear data
      (this.stepOne.get('sizes') as FormArray).clear();
      this.visibleFields = [];
      this.showFlag2 = false;
      this.selectedSizes = [];
      this.sizeChartFields = [];
      this.sizeSet = [];
     

      this.visibleFields = res[0].inputs;
      this.createFormControls(this.visibleFields);

      if (this.productId) {
        this.stepOne.patchValue(this.productDetails);
      }

      // Check if "Size Set" or "Waist Size Set" is available
      this.foundSizeSet = this.visibleFields.find((field: any) => field === "Size Set" || field === "Waist Size Set");
      this.showFlag2 = true;
      if (this.productId) {
        // Format and patch dates
        const formattedDate1 = this.datePipe.transform(this.productDetails.dateOfManufacture, 'yyyy-MM-dd');
        const formattedDate2 = this.datePipe.transform(this.productDetails.dateOfListing, 'yyyy-MM-dd');
        this.stepOne.patchValue({
          dateOfManufacture: formattedDate1,
          dateOfListing: formattedDate2,  //          
        });
      }

      if (this.foundSizeSet) {       
        // Pass the found element to the function if either exists      
        this.getSizeSetForProducts(this.foundSizeSet);
      }      
    } catch (error) {
      console.error('Error mapping data:', error);
    }
  }


  getSizeSetForProducts(type: any) {
    this.sizeChart = '';
    this.sizeChart = '';
    const setType = type
    this.authService.get(`size-set/size-type/size-set?sizeType=${setType}`).subscribe((data) => {
      this.sizeSet = data.Sizes;
      this.sizeChartdata=data.sizeChart
      // for patch size array
      if (this.productId) {
        this.patchSizesArray(this.productDetails.sizes);
      }
      this.getSizeChartFields()
    })
  }

  // save Forms step One
  saveStepOneData() {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.submittedStep1 = true   
    const designNumber = this.stepOne.get('designNumber')?.value;
    const brand = this.stepOne.get('brand')?.value;  

    if (this.stepOne.valid) {
      const productBy = this.userProfile.email
      // Add the createdBy property to stepOne's value
      const formData = this.stepOne.getRawValue();
      const stepOneData = {
        ...formData,
        productBy: productBy,
        city: this.locationData.city,
        state: this.locationData.state,
        country: this.locationData.country,
      };

      this.spinner.show()
      this.authService.post('type2-products', stepOneData).subscribe(res => {
        if (res) {
          this.spinner.hide();
          this.productId = res.id 
          // updated deatilas
          this.productDetails=res;        
          this.communicationService.showNotification(
            'snackbar-success',
            `Saved Successfully...!!!`,
            'bottom',
            'center'
          );
          this.next.emit(this.productId);

        }
      },
        (error) => {
          this.spinner.hide();
          Swal.fire({
            title: 'Product Exists',
            text: `The Design No. ${designNumber} already exists for ${brand}.`,
             icon: 'error'
          });
          console.log('error saveStepOneData')
        })
    }
  }

  async getProductDataById() {
    this.spinner.show();
    try {
      const res = await this.authService.getById('type2-products', this.productId).toPromise();
      this.productDetails = res;      

      if (this.productDetails) {
       
        if (this.currentStep === 2) {
          this.colourCollections = this.productDetails.colourCollections;          
        } else {
          this.stepOne.patchValue(this.productDetails);

          // Fetch categories and subcategories
          await this.getCategoryByProductTypeAndGender(this.productDetails.productType, this.productDetails.gender);        
          await this.getSubCategoryBYProductType_Gender_and_Category(
            this.productDetails.productType,
            this.productDetails.gender,
            this.productDetails.clothing
          );

          // // Patch dimensions
          // if (this.productDetails.ProductDeimension?.length) {
          //   this.stepOne.get('ProductDeimension')?.patchValue({
          //     length: this.productDetails.ProductDeimension[0].length,
          //     width: this.productDetails.ProductDeimension[0].width,
          //     height: this.productDetails.ProductDeimension[0].height,
          //   });
          // }

          // Patch sizes
          this.patchSizesArray(this.productDetails.sizes);
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);

    } finally {
      this.spinner.hide();
    }
  }



  onEditFormData(data: any) {
    const formattedDate = this.datePipe.transform(data.dateOfManufacture, 'yyyy-MM-dd');
    this.stepOne.patchValue({
      quantity: data.quantity,
      dateOfManufacture: formattedDate,
    });
  }

  patchSizesArray(sizes: any[]) {
    const sizesArray = this.stepOne.get('sizes') as FormArray;
    sizesArray.clear(); // Clear existing values
    this.selectedSizes = [];

    if(this.foundSizeSet === 'Size Set'){

      sizes.forEach(size => {
        sizesArray.push(this.fb.group({
          standardSize: [size.standardSize],
          brandSize: [size.brandSize, Validators.required],
          chestSize: [size.chestSize, [Validators.required, Validators.pattern(/^\d+$/)]],
          shoulderSize: [size.shoulderSize, [Validators.required, Validators.pattern(/^\d+$/)]],
          frontLength: [size.frontLength, [Validators.required, Validators.pattern(/^\d+$/)]],
          neckSize: [size.neckSize], // Removed Validators.required to make it optional
          manufacturerPrice: [size.manufacturerPrice,[Validators.required, Validators.pattern(/^\d+$/)]],
          RtlPrice: [size.RtlPrice, [Validators.required, Validators.pattern(/^\d+$/)]],
          singleMRP: [size.singleMRP, [Validators.required, Validators.pattern(/^\d+$/)]]
        }));
        this.selectedSizes.push(size.standardSize); // Keep track of selected sizes
      });
      
  }
  else{
    sizes.forEach(size => {
      sizesArray.push(this.fb.group({
        standardSize: [size.standardSize],
        brandSize: [size.brandSize, Validators.required],
        waistSizeSetStandardSize: [size.waistSizeSetStandardSize, [Validators.required, Validators.pattern('^[0-9]*$')]],
        waist: [size.waist, [Validators.required, Validators.pattern('^[0-9]*$')]],
        inseam: [size.inseam, [Validators.required, Validators.pattern('^[0-9]*$')]],
        lengthIn: [size.lengthIn,[Validators.required, Validators.pattern('^[0-9]*$')]],
        rise: [size.rise,[Validators.required, Validators.pattern('^[0-9]*$')]],
        // length: [size.length],
        // width: [size.width],
        // height: [size.height],
        // weight: [size.weight, Validators.required],
        manufacturerPrice: [size.manufacturerPrice, [Validators.required, Validators.pattern('^[0-9]*$')]],
        RtlPrice:[size.RtlPrice, [Validators.required, Validators.pattern('^[0-9]*$')]],
        singleMRP: [size.singleMRP, [Validators.required, Validators.pattern('^[0-9]*$')]]
      }));
      this.selectedSizes.push(size.standardSize); // Keep track of selected sizes
    });
  }
    
  }

  // update step one data
  UpdateStepOne() {  
    this.submittedStep1 = true;     
    const designNumber = this.stepOne.get('designNumber')?.value;
    const brand = this.stepOne.get('brand')?.value;  
    
    if (this.stepOne.invalid) {
      return;
    }
    else {
      this.spinner.show()
      const formData = this.stepOne.getRawValue();
      this.authService.patchWithEmail(`type2-products/${this.productId}`, formData).subscribe(res => {
        if (res) {
          this.colourCollections = res.colourCollections
          // this.updateValidators()
          this.spinner.hide()

          this.communicationService.showNotification(
            'snackbar-success',
            `Saved Successfully...!!!`,
            'bottom',
            'center'
          );
          // setTimeout(() => {
          //   this.currentStep++;
          // }, 1500);
          this.next.emit(this.productId);
        }

      },
        error => {
          Swal.fire({
            title: 'Product Exists',
            text: `The Design No. ${designNumber} already exists for ${brand}.`,
             icon: 'error'
          });
          console.log('error UpdateStepOne')
        });
    }
  }


  // all Masters

  // all Masters data======================

  getAllGender(){
    this.authService.get('gender').subscribe((res:any)=>{
      this.allGender=res.results
    })
  }

  getAllBrands() {
    this.authService.get(`brand?brandOwner=${this.authService.currentUserValue.email}`).subscribe(res => {
      if (res) {
        this.allBrands = res.results.map((item: any) => item.brandName);
      }

    },
      error => {
        console.log('error')
      })
  }

  getAllLifeStyle() {
    this.authService.get('lifestyle').subscribe(res => {
      if (res) {
        this.allLifeStyle = res.results.map((item: any) => item.name);
      }

    },
      error => {
        console.log('error')
      })
  }

  getMaterial() {
    this.authService.get('material').subscribe(res => {
      if (res) {
        this.allMaterialType = res.results
      }

    },
      error => {
        console.log('error')
      })
  }

  getFabricPttern() {
    this.authService.get('pattern').subscribe(res => {
      if (res) {
        this.allFabricPattern = res.results
      }
    },
      error => {
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
      error => {
        console.log('error')
      })
  }

  getNeckStyle() {
    this.authService.get('neck-style').subscribe(res => {
      if (res) {
        this.allNeckStyle = res.results
      }
    },
      error => {
        console.log('error')
      })
  }


  getTopstyle() {
    this.authService.get('topstyle').subscribe(res => {
      if (res) {
        this.allTopstyle = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getWomensleevetype() {
    this.authService.get('womensleevetype').subscribe(res => {
      if (res) {
        this.allWomensleevetype = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getEmbellishmentfeature() {
    this.authService.get('embellishmentfeature').subscribe(res => {
      if (res) {
        this.allEmbellishmentfeature = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getNoofpockets() {
    this.authService.get('noOfPockets').subscribe(res => {
      if (res) {
        this.allNoofpockets = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getCoinpocket() {
    this.authService.get('coinpocket').subscribe(res => {
      if (res) {
        this.allCoinpocket = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getWaistsizeset() {
    this.authService.get('waistsizeset').subscribe(res => {
      if (res) {
        this.allWaistsizeset = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getTrouserfittype() {
    this.authService.get('trouserfittype').subscribe(res => {
      if (res) {
        this.allTrouserfittype = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getRisestyle() {
    this.authService.get('risestyle').subscribe(res => {
      if (res) {
        this.allRisestyle = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getTrouserstyle() {
    this.authService.get('trouserstyle').subscribe(res => {
      if (res) {
        this.allTrouserstyle = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getTrouserpocket() {
    this.authService.get('trouserpocket').subscribe(res => {
      if (res) {
        this.allTrouserpocket = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getAllLayerCompression(){
    this.authService.get('layer-compression').subscribe(res => {
      if (res) {
        this.allLayerCompression = res.results
        console.log(this.allLayerCompression);
      }
    },
      error => {
        console.log('error')
      })
  }

  getAllWaistband(){
    this.authService.get('waistband').subscribe(res => {
      if (res) {
        this.allWaistband = res.results
      }
    },
      error => {
        console.log('error')
      })
  }
  getAllClosureType() {
    this.authService.get('closure-type').subscribe(res => {
      if (res) {
        this.allClosureType = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getPocketDiscription() {
    this.authService.get('pocket-discription').subscribe(res => {
      if (res) {
        this.allPocketDiscription = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getSleeveCutStyle() {
    this.authService.get('sleev-cut-style').subscribe(res => {
      if (res) {
        this.allSleeveCutStyle = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getSleeveLength() {
    this.authService.get('sleeve-length').subscribe(res => {
      if (res) {
        this.allSleeveLength = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getSpecialFeature() {
    this.authService.get('special-feature').subscribe(res => {
      if (res) {
        this.allSpecialFeature = res.results.map((item: any) => item.name);
      }
    },
      error => {
        console.log('error')
      })
  }

  getAllCurrencyCode() {
    this.authService.get('currency').subscribe(res => {
      if (res) {
        const data = res.results
        this.currencies = Object.entries(data).map(([code, name]) => ({ code, name }));
      }
    })
  }

  getallCareInstruction() {
    this.authService.get('care-instruction').subscribe(res => {
      if (res) {
        this.allCareInstruction = res.results
      }
    },
      error => {
        console.log('error')
      })
  }

  getAllSeasons(){
    this.authService.get('season').subscribe(res => {
      if (res) {
        this.allSeasons = res.results
      }
    },
      error => {
        console.log('error')
      })
  }
  // master for womens data


getAllWaistType() {
    this.authService.get('waisttype').subscribe(res => {
        if (res) {
            this.AllwaistType = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllWeaveType() {
    this.authService.get('weavetype').subscribe(res => {
        if (res) {
            this.AllweaveType = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllEthnicDesign() {
    this.authService.get('ethnicdesign').subscribe(res => {
        if (res) {
            this.AllethnicDesign = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllSareeStyle() {
    this.authService.get('sareestyle').subscribe(res => {
        if (res) {
            this.AllsareeStyle = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllWomenStyle() {
    this.authService.get('womenstyle').subscribe(res => {
        if (res) {
            this.AllwomenStyle = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllWorkType() {
    this.authService.get('worktype').subscribe(res => {
        if (res) {
            this.AllworkType = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllFinishType() {
    this.authService.get('finishtype').subscribe(res => {
        if (res) {
            this.AllfinishType = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllApparelSilhouette() {
    this.authService.get('apparelsilhouette').subscribe(res => {
        if (res) {
            this.AllapparelSilhouette = res.results;
        }
    },
    error => {
        console.log('error');
    });
}


getAllEthnicBottomsStyle() {
    this.authService.get('ethnic-bottoms-style').subscribe(res => {
        if (res) {
            this.AllethnicBottomsStyle = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

//   getAllBlazerClosureType() {
//     this.authService.get('blazerclousertype').subscribe(res => {
//         if (res) {
//             this.AllblazerClosureType = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllWomenKurtaLength() {
//     this.authService.get('women-kurta-length').subscribe(res => {
//         if (res) {
//             this.AllwomenKurtaLength = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllBackStyle() {
//     this.authService.get('backstyle').subscribe(res => {
//         if (res) {
//             this.AllbackStyle = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllBraSize() {
//     this.authService.get('brasize').subscribe(res => {
//         if (res) {
//             this.AllbraSize = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllBraStyle() {
//     this.authService.get('brastyle').subscribe(res => {
//         if (res) {
//             this.AllbraStyle = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllBraPadType() {
//     this.authService.get('brapadtype').subscribe(res => {
//         if (res) {
//             this.AllbraPadType = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllBraClosure() {
//     this.authService.get('braclosure').subscribe(res => {
//         if (res) {
//             this.AllbraClosure = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllCupSize() {
//     this.authService.get('cupsize').subscribe(res => {
//         if (res) {
//             this.AllcupSize = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllOpacity() {
//     this.authService.get('opacity').subscribe(res => {
//         if (res) {
//             this.Allopacity = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllEntityType() {
//     this.authService.get('entitytype').subscribe(res => {
//         if (res) {
//             this.AllentityType = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }

// getAllSizeSet() {
//     this.authService.get('size-set').subscribe(res => {
//         if (res) {
//             this.AllsizeSet = res.results;
//         }
//     },
//     error => {
//         console.log('error');
//     });
// }



getAllSocksStyle() {
    this.authService.get('socks-style').subscribe(res => {
        if (res) {
            this.Allsocksstyle = res.results;
        }
    },
    error => {
        console.log('error');
    });
}

getAllTrourserPocket() {
  this.authService.get('trouserpocket').subscribe(res => {
      if (res) {
          this.allTrourserPocket = res.results;
      }
  },
  error => {
      console.log('error');
  });
}
getAllIncludedComponent() {
  this.authService.get('include-componenet').subscribe(res => {
      if (res) {
          this.allIncludedComponent = res.results;
      }
  },
  error => {
      console.log('error');
  });
}

getAllCollarStyle() {
  this.authService.get('collar-style').subscribe(res => {
      if (res) {
          this.Allcollarstyle = res.results;
      }
  },
  error => {
      console.log('error');
  });
}

getallItemLength() {
  this.authService.get('length-women-dress').subscribe(res => {
      if (res) {
          this.allItemLength = res.results;
      }
  },
  error => {
      console.log('error');
  });
}

getAllelasticity(){
  this.authService.get('elastic').subscribe(res => {
    if (res) {
        this.Allelasticity = res.results;
    }
},
error => {
    console.log('error');
});
}

// getAllFitStyle(){
//   this.authService.get('fit-type').subscribe(res => {
//     if (res) {
//         this.allFitStyle = res.results;
//     }
// },
// error => {
//     console.log('error');
// });
// }

onBrandChange() {
  const designNumber = this.stepOne.get('designNumber')?.value;
  const brand = this.stepOne.get('brand')?.value;

  // If both design number and brand are filled, check if the product exists
  if (designNumber && brand) {
    // Use setTimeout to debounce the check
    setTimeout(() => {
      const requestBody = { designNumber, brand };

      this.authService.post('/type2-products/check-product-existence', requestBody)
        .pipe(
          catchError(() => {
            this.brandErrorMessage = '';  // Reset error message if no error occurs
            return of(null);  // Continue with a safe fallback
          })
        )
        .subscribe((response: any) => {
          if (response && response.message === "Product exists") {
            // If product exists for the selected brand, show SweetAlert popup
            this.brandErrorMessage = `The Design No. ${designNumber} already exists for ${brand}.`;
            Swal.fire({
              title: 'Product Exists',
              text: `The Design No. ${designNumber} already exists for ${brand}.`,
              // icon: 'error'
            });
            this.stepOne.get('brand')?.setErrors({ 'exists': true });
          } else if (response && response.message === "Product does not exist") {
            // If the product does not exist, clear previous errors
            this.stepOne.get('brand')?.setErrors(null);
          }
        });
    });  // Debounce delay (500ms)
  }
}


  
}
