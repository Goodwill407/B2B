import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { switchMap, of } from 'rxjs';

interface RackRowMapping {
  rackName: string;
  rowName: string;
}


@Component({
  selector: 'app-add-update-raw-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    AutoCompleteModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    FileUploadModule,
    DropdownModule,
  ],
  templateUrl: './add-update-raw-item.component.html',
  styleUrl: './add-update-raw-item.component.scss',
})
export class AddUpdateRawItemComponent implements OnInit {
  itemForm!: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  loading = false;
  manufacturerEmail = '';


  // Photo uploads
  photo1File: File | null = null;
  photo2File: File | null = null;
  photo1Preview: string | null = null;
  photo2Preview: string | null = null;


  // Dropdown data
  categories: any[] = [];
  subcategories: any[] = [];
  vendors: any[] = [];
  warehouses: any[] = [];


  // Filtered suggestions for autocomplete
  filteredCategories: any[] = [];
  filteredSubcategories: any[] = [];
  filteredVendors: any[] = [];
  filteredWarehouses: any[] = [];


  // Selected values
  selectedCategory: any = null;
  selectedSubcategory: any = null;
  selectedVendor: any = null;
  selectedWarehouse: any = null;


  // Lazy loading flags
  categoriesLoaded = false;
  vendorsLoaded = false;
  warehousesLoaded = false;


  // Loading states
  loadingCategories = false;
  loadingVendors = false;
  loadingWarehouses = false;


  // Rack and Row data
  availableRacks: any[] = [];
  rackRowMappings: RackRowMapping[] = [{ rackName: '', rowName: '' }];
  currentRowOptions: { [index: number]: string[] } = {};


  // Duplicate validation
  rackRowDuplicateError = false;
  duplicateIndex: number = -1;


  // Stock units array
  stockUnits: string[] = [
    'kg',
    'gram',
    'liter',
    'ml',
    'nos',
    'pieces',
    'meter',
    'foot',
    'cm',
    'inch',
    'box',
    'packet',
    'dozen',
    'ton'
  ];


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.initializeForm();
  }


  ngOnInit(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.manufacturerEmail = currentUser?.email || '';


    this.itemId = this.route.snapshot.paramMap.get('id');


    if (this.itemId) {
      this.isEditMode = true;
      this.loadItem(this.itemId);
    }
  }


  initializeForm(): void {
    this.itemForm = this.fb.group({
      itemName: ['', [Validators.required, Validators.minLength(2)]],
      code: ['', Validators.required], 
      stockInHand: [0, [Validators.required, Validators.min(0)]],
      stockUnit: ['', Validators.required],
      details: [''],
      note: [''],
      isActive: [true],
    });
  }


  // ==================== CATEGORY METHODS ====================


  onCategoryDropdownClick(): void {
    if (!this.categoriesLoaded && !this.loadingCategories) {
      this.loadCategories();
    }
  }


  loadCategories(): void {
    this.loadingCategories = true;
    this.authService
      .get(`manufacture-category?limit=1000&manufacturerEmail=${this.manufacturerEmail}`)
      .subscribe(
        (res: any) => {
          const data = res.data || res;
          this.categories = data.results || [];
          this.filteredCategories = [...this.categories];
          this.categoriesLoaded = true;
          this.loadingCategories = false;
        },
        () => {
          this.communicationService.customError1('Failed to load categories');
          this.loadingCategories = false;
        }
      );
  }


  filterCategories(event: any): void {
    if (!this.categoriesLoaded && !this.loadingCategories) {
      this.loadCategories();
      return;
    }


    const query = event.query.toLowerCase();
    this.filteredCategories = this.categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) || cat.code.toLowerCase().includes(query)
    );
  }


  onCategorySelect(event: any): void {
    const category = event.value || event;
    this.selectedCategory = category;
    this.selectedSubcategory = null;
    this.subcategories = [];
    this.filteredSubcategories = [];


    if (category && (category.id || category._id)) {
      this.loadSubcategories(category.id || category._id);
    }
  }


  // ==================== SUBCATEGORY METHODS ====================


  loadSubcategories(categoryId: string): void {
    this.authService
      .get(
        `manufacture-subcategory?categoryId=${categoryId}&limit=1000&manufacturerEmail=${this.manufacturerEmail}`
      )
      .subscribe(
        (res: any) => {
          const data = res.data || res;
          this.subcategories = data.results || [];
          this.filteredSubcategories = [...this.subcategories];
        },
        (err) => {
          console.error('Error loading subcategories:', err);
          this.subcategories = [];
          this.filteredSubcategories = [];
        }
      );
  }


  filterSubcategories(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredSubcategories = this.subcategories.filter(
      (sub) =>
        sub.subcategoryName.toLowerCase().includes(query) ||
        sub.subcategoryCode.toLowerCase().includes(query)
    );
  }


  onSubcategorySelect(event: any): void {
    const subcategory = event.value || event;
    this.selectedSubcategory = subcategory;
  }


  // ==================== VENDOR METHODS ====================


  onVendorDropdownClick(): void {
    if (!this.vendorsLoaded && !this.loadingVendors) {
      this.loadVendors();
    }
  }


  loadVendors(): void {
    this.loadingVendors = true;
    this.authService
      .get(`manufacturer-vendors?limit=1000&manufacturerEmail=${this.manufacturerEmail}`)
      .subscribe(
        (res: any) => {
          const data = res.data || res;
          this.vendors = data.results || [];
          this.filteredVendors = [...this.vendors];
          this.vendorsLoaded = true;
          this.loadingVendors = false;
        },
        () => {
          this.communicationService.customError1('Failed to load vendors');
          this.loadingVendors = false;
        }
      );
  }


  filterVendors(event: any): void {
    if (!this.vendorsLoaded && !this.loadingVendors) {
      this.loadVendors();
      return;
    }


    const query = event.query.toLowerCase();
    this.filteredVendors = this.vendors.filter(
      (vendor) =>
        vendor.vendorName.toLowerCase().includes(query) ||
        vendor.companyName.toLowerCase().includes(query)
    );
  }


  onVendorSelect(event: any): void {
    const vendor = event.value || event;
    this.selectedVendor = vendor;
  }


  // ==================== WAREHOUSE METHODS ====================


  onWarehouseDropdownClick(): void {
    if (!this.warehousesLoaded && !this.loadingWarehouses) {
      this.loadWarehouses();
    }
  }


  loadWarehouses(): void {
    this.loadingWarehouses = true;
    this.authService
      .get(`manufacture-warehouse?limit=1000&manufacturerEmail=${this.manufacturerEmail}`)
      .subscribe(
        (res: any) => {
          const data = res.data || res;
          this.warehouses = data.results || [];
          this.filteredWarehouses = [...this.warehouses];
          this.warehousesLoaded = true;
          this.loadingWarehouses = false;
        },
        () => {
          this.communicationService.customError1('Failed to load warehouses');
          this.loadingWarehouses = false;
        }
      );
  }


  filterWarehouses(event: any): void {
    if (!this.warehousesLoaded && !this.loadingWarehouses) {
      this.loadWarehouses();
      return;
    }


    const query = event.query.toLowerCase();
    this.filteredWarehouses = this.warehouses.filter(
      (wh) =>
        wh.warehouseName.toLowerCase().includes(query) || wh.code.toLowerCase().includes(query)
    );
  }


  onWarehouseSelect(event: any): void {
    const warehouse = event.value || event;
    this.selectedWarehouse = warehouse;


    this.availableRacks = [];
    this.currentRowOptions = {};
    this.rackRowMappings = [{ rackName: '', rowName: '' }];
    this.rackRowDuplicateError = false;
    this.duplicateIndex = -1;


    if (warehouse && warehouse.racks && warehouse.racks.length > 0) {
      this.availableRacks = warehouse.racks;
    }
  }


  // ==================== RACK & ROW METHODS ====================


  onRackChange(index: number): void {
    const selectedRackName = this.rackRowMappings[index].rackName;
    this.rackRowMappings[index].rowName = '';
    this.rackRowDuplicateError = false;
    this.duplicateIndex = -1;


    if (selectedRackName && this.availableRacks.length > 0) {
      const rack = this.availableRacks.find((r) => r.rackName === selectedRackName);
      if (rack) {
        this.currentRowOptions[index] = rack.rowNames || [];
      } else {
        this.currentRowOptions[index] = [];
      }
    } else {
      this.currentRowOptions[index] = [];
    }
  }


  onRowChange(index: number): void {
    this.validateRackRowCombination(index);
  }


  validateRackRowCombination(currentIndex: number): void {
    this.rackRowDuplicateError = false;
    this.duplicateIndex = -1;

    const currentMapping = this.rackRowMappings[currentIndex];
    
    if (!currentMapping.rackName || !currentMapping.rowName) {
      return;
    }

    const isDuplicate = this.rackRowMappings.some((mapping, index) => {
      if (index === currentIndex) {
        return false;
      }
      return (
        mapping.rackName === currentMapping.rackName &&
        mapping.rowName === currentMapping.rowName
      );
    });

    if (isDuplicate) {
      this.rackRowDuplicateError = true;
      this.duplicateIndex = currentIndex;
      this.communicationService.customError1(
        'This rack and row combination is already selected. Please choose a different combination.'
      );
    }
  }


  getRowOptionsForIndex(index: number): string[] {
    return this.currentRowOptions[index] || [];
  }


  addRackRow(): void {
    if (this.rackRowDuplicateError) {
      this.communicationService.customError1(
        'Please fix the duplicate rack-row combination before adding a new one.'
      );
      return;
    }

    this.rackRowMappings.push({ rackName: '', rowName: '' });
  }


  removeRackRow(index: number): void {
    if (this.rackRowMappings.length <= 1) {
      return;
    }


    this.rackRowMappings.splice(index, 1);


    const newOptions: { [index: number]: string[] } = {};


    this.rackRowMappings.forEach((mapping, newIndex) => {
      if (mapping.rackName) {
        const rack = this.availableRacks.find((r) => r.rackName === mapping.rackName);
        if (rack) {
          newOptions[newIndex] = rack.rowNames || [];
        }
      }
    });


    this.currentRowOptions = newOptions;
    this.rackRowDuplicateError = false;
    this.duplicateIndex = -1;
  }


  // ==================== PHOTO METHODS ====================


  onPhoto1Select(event: any): void {
    const file = event.files[0];
    if (file) {
      this.photo1File = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photo1Preview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  onPhoto2Select(event: any): void {
    const file = event.files[0];
    if (file) {
      this.photo2File = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photo2Preview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }


  removePhoto1(): void {
    this.photo1File = null;
    this.photo1Preview = null;
  }


  removePhoto2(): void {
    this.photo2File = null;
    this.photo2Preview = null;
  }


  // ==================== LOAD ITEM FOR EDIT ====================


  async loadItem(id: string): Promise<void> {
  this.loading = true;
  
  try {
    const res: any = await this.authService.get(`manufacture-item/${id}`).toPromise();
    const item = res.data || res;

    this.itemForm.get('stockInHand')?.disable();

    this.itemForm.patchValue({
      itemName: item.itemName,
      code: item.code,
      stockInHand: item.stockInHand,
      stockUnit: item.stockUnit || '',
      details: item.details,
      note: item.note,
      isActive: item.isActive,
    });


    if (item.photo1) {
      this.photo1Preview = item.photo1;
    }
    if (item.photo2) {
      this.photo2Preview = item.photo2;
    }


    if (item.categoryId) {
      this.selectedCategory = {
        id: item.categoryId,
        name: item.categoryName,
        code: item.categoryCode,
      };


      const subRes: any = await this.authService
        .get(
          `manufacture-subcategory?categoryId=${item.categoryId}&limit=1000&manufacturerEmail=${this.manufacturerEmail}`
        )
        .toPromise();


      const subData = subRes.data || subRes;
      this.subcategories = subData.results || [];
      this.filteredSubcategories = [...this.subcategories];


      let subcategoryIdToMatch = '';
      
      if (typeof item.subcategoryId === 'object' && item.subcategoryId !== null) {
        subcategoryIdToMatch = item.subcategoryId.id || item.subcategoryId._id;
      } else if (typeof item.subcategoryId === 'string') {
        subcategoryIdToMatch = item.subcategoryId;
      }


      if (subcategoryIdToMatch) {
        const matchedSub = this.subcategories.find(
          (s) => (s.id || s._id) === subcategoryIdToMatch
        );


        if (matchedSub) {
          setTimeout(() => {
            this.selectedSubcategory = matchedSub;
            this.filteredSubcategories = [...this.subcategories];
          }, 100);
        }
      }
    }


    if (item.vendorDetails) {
      this.selectedVendor = {
        id: item.vendorDetails.id || item.vendorDetails._id,
        vendorName: item.vendorDetails.vendorName,
        companyName: item.vendorDetails.companyName,
        contactPersonName: item.vendorDetails.contactPersonName,
        email: item.vendorDetails.vendorEmail || item.vendorDetails.email,
        contactNumber: item.vendorDetails.contactNumber,
        gstNumber: item.vendorDetails.gstNumber,
        panNumber: item.vendorDetails.panNumber,
        address: item.vendorDetails.address,
      };
    }


    if (item.warehouseDetails) {
      this.selectedWarehouse = {
        id: item.warehouseDetails.id || item.warehouseDetails._id,
        warehouseName: item.warehouseDetails.warehouseName,
        code: item.warehouseDetails.code,
        contactPersonName: item.warehouseDetails.contactPersonName,
        contactNumber: item.warehouseDetails.contactNumber,
        email: item.warehouseDetails.email,
        gstNumber: item.warehouseDetails.gstNumber,
        address: item.warehouseDetails.address,
        isPrimary: item.warehouseDetails.isPrimary,
        storageCapacity: item.warehouseDetails.storageCapacity,
        racks: [],
      };


      const whRes: any = await this.authService
        .get(
          `manufacture-warehouse?code=${item.warehouseDetails.code}&manufacturerEmail=${this.manufacturerEmail}`
        )
        .toPromise();


      const whData = whRes.data || whRes;
      const warehouses = whData.results || [];


      if (warehouses.length > 0) {
        const warehouse = warehouses[0];
        this.selectedWarehouse.racks = warehouse.racks || [];
        this.availableRacks = warehouse.racks || [];


        if (item.rackRowMappings && item.rackRowMappings.length > 0) {
          this.rackRowMappings = [...item.rackRowMappings];


          this.rackRowMappings.forEach((mapping, index) => {
            if (mapping.rackName) {
              const rack = this.availableRacks.find((r) => r.rackName === mapping.rackName);
              if (rack) {
                this.currentRowOptions[index] = rack.rowNames || [];
              }
            }
          });
        }
      }
    }


    this.loading = false;
  } catch (error) {
    this.communicationService.customError1('Failed to load item');
    this.loading = false;
  }
}


  // ==================== SUBMIT ====================

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched(this.itemForm);
      this.communicationService.customError1('Please fill all required fields');
      return;
    }

    if (
      !this.selectedCategory ||
      !this.selectedSubcategory ||
      !this.selectedVendor ||
      !this.selectedWarehouse
    ) {
      this.communicationService.customError1(
        'Please select category, subcategory, vendor, and warehouse'
      );
      return;
    }

    const validMappings = this.rackRowMappings.filter((m) => m.rackName && m.rowName);

    if (validMappings.length === 0) {
      this.communicationService.customError1('Please select at least one rack and row');
      return;
    }

    // Check for duplicate rack-row combinations
    const uniqueMappings = new Set();
    for (const mapping of validMappings) {
      const key = `${mapping.rackName}|${mapping.rowName}`;
      if (uniqueMappings.has(key)) {
        this.communicationService.customError1(
          'Duplicate rack and row combinations found. Each combination must be unique.'
        );
        return;
      }
      uniqueMappings.add(key);
    }

    this.loading = true;

    const formData = new FormData();

    formData.append('itemName', this.itemForm.get('itemName')?.value);
    formData.append('code', this.itemForm.get('code')?.value || '');

    // Get stock value even if disabled (for edit mode logic or backend reference)
    const stockValue = this.itemForm.getRawValue().stockInHand;
    formData.append('stockInHand', stockValue.toString());

    formData.append('stockUnit', this.itemForm.get('stockUnit')?.value);
    formData.append('details', this.itemForm.get('details')?.value || '');
    formData.append('note', this.itemForm.get('note')?.value || '');
    formData.append('isActive', this.itemForm.get('isActive')?.value.toString());

    let categoryId: string = '';
    let subcategoryId: string = '';

    if (typeof this.selectedCategory === 'string') {
      categoryId = this.selectedCategory;
    } else if (this.selectedCategory && typeof this.selectedCategory === 'object') {
      categoryId = this.selectedCategory.id || this.selectedCategory._id || '';
    }

    if (typeof this.selectedSubcategory === 'string') {
      subcategoryId = this.selectedSubcategory;
    } else if (this.selectedSubcategory && typeof this.selectedSubcategory === 'object') {
      subcategoryId = this.selectedSubcategory.id || this.selectedSubcategory._id || '';
    }

    if (!categoryId || categoryId.includes('object')) {
      this.communicationService.customError1('Invalid category. Please reselect category.');
      this.loading = false;
      return;
    }

    if (!subcategoryId || subcategoryId.includes('object')) {
      this.communicationService.customError1('Invalid subcategory. Please reselect subcategory.');
      this.loading = false;
      return;
    }

    formData.append('categoryId', categoryId);
    formData.append('categoryName', this.selectedCategory.name || '');
    formData.append('categoryCode', this.selectedCategory.code || '');

    formData.append('subcategoryId', subcategoryId);
    formData.append('subcategoryName', this.selectedSubcategory.subcategoryName || '');
    formData.append('subcategoryCode', this.selectedSubcategory.subcategoryCode || '');

    formData.append(
      'vendorDetails',
      JSON.stringify({
        vendorName: this.selectedVendor.vendorName,
        companyName: this.selectedVendor.companyName,
        contactPersonName: this.selectedVendor.contactPersonName,
        vendorEmail: this.selectedVendor.email || this.selectedVendor.vendorEmail,
        contactNumber: this.selectedVendor.contactNumber,
        gstNumber: this.selectedVendor.gstNumber,
        panNumber: this.selectedVendor.panNumber,
        address: this.selectedVendor.address,
      })
    );

    formData.append(
      'warehouseDetails',
      JSON.stringify({
        warehouseName: this.selectedWarehouse.warehouseName,
        code: this.selectedWarehouse.code,
        contactPersonName: this.selectedWarehouse.contactPersonName,
        contactNumber: this.selectedWarehouse.contactNumber,
        email: this.selectedWarehouse.email,
        gstNumber: this.selectedWarehouse.gstNumber,
        address: this.selectedWarehouse.address,
        isPrimary: this.selectedWarehouse.isPrimary,
        storageCapacity: this.selectedWarehouse.storageCapacity,
      })
    );

    formData.append('rackRowMappings', JSON.stringify(validMappings));

    if (this.photo1File) {
      formData.append('photo1', this.photo1File);
    }
    if (this.photo2File) {
      formData.append('photo2', this.photo2File);
    }

    formData.append('manufacturerEmail', this.manufacturerEmail);

    const url = this.isEditMode ? `manufacture-item/${this.itemId}` : 'manufacture-item';

    // === CHANGED LOGIC STARTS HERE ===

    if (this.isEditMode) {
      // --- Edit Mode: Only Update Master Item ---
      this.authService.patchpimage(url, formData).subscribe(
        () => {
          this.communicationService.customSuccess('Item updated successfully');
          this.router.navigate(['/mnf/view-raw-items']);
        },
        (err: any) => {
          this.communicationService.customError1(err?.error?.message || 'Failed to update item');
          this.loading = false;
        }
      );
    } else {
      // --- Add Mode: Create Master -> Create Inventory -> Add Stock ---
      
      // Step 1: Create Master Item
      this.authService.postpimage(url, formData).pipe(
        switchMap((res: any) => {
          
          const masterItem = res.data || res; 
          masterItem.stockInHand = 0;
          
          const masterItemId = masterItem.id || masterItem._id;

          // Step 2: Create Inventory Record
          // API: POST /manufacture-raw-material-inventory-logs
          const inventoryBody = { masterItemId: masterItemId ,
            manufacturerEmail: this.manufacturerEmail,
            itemName: this.itemForm.get('itemName')?.value,
            data: masterItem
          };
          return this.authService.post('manufacture-raw-material-inventory-logs', inventoryBody).pipe(
            switchMap((invRes: any) => {
               // If user entered 0 or negative stock, we stop here (Inventory created with 0 stock)
               if (!stockValue || stockValue <= 0) return of(invRes);

               // Step 3: Add Initial Stock (Only if stock > 0)
               // We need the ID of the newly created inventory log from Step 2
               const inventoryData = invRes.data || invRes;
               // Check where ID is located (usually .id or ._id inside data)
               // If Create API returns the full object:
               const inventoryId = inventoryData.id || inventoryData._id;

               if(!inventoryId) {
                  // Fallback if ID is missing, just return success of creation
                  console.warn('Inventory ID not found in response, skipping stock add');
                  return of(invRes); 
               }

               // API: PATCH /manufacture-raw-material-inventory-logs/:id
               const updateBody = {
                 masterItemId: masterItemId,
                 quantity: Number(stockValue),
                 changeType: 'stock_added',
                 reason: 'Initial Stock Entry',
                 updatedBy: this.manufacturerEmail 
               };

               return this.authService.patchpimage(`manufacture-raw-material-inventory-logs/${inventoryId}`, updateBody);
            })
          );
        })
      ).subscribe(
        () => {
          this.communicationService.customSuccess('Item and Inventory created successfully');
          this.router.navigate(['/mnf/view-raw-items']);
        },
        (err: any) => {
          console.error('Creation Error:', err);
          this.communicationService.customError1(
            err?.error?.message || 'Failed to complete item creation. Please check inventory logs.'
          );
          this.loading = false;
        }
      );
    }
  }

  cancel(): void {
    this.location.back();
  }


  private markFormGroupTouched(group: FormGroup): void {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  isFieldInvalid(path: string): boolean {
    const ctrl = this.itemForm.get(path);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }


  getErrorMessage(path: string): string {
    const control = this.itemForm.get(path);
    if (!control) return '';
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) {
      const len = control.getError('minlength')?.requiredLength;
      return `Minimum length is ${len}`;
    }
    if (control.hasError('min')) {
      return 'Value must be at least 0';
    }
    return '';
  }
}
