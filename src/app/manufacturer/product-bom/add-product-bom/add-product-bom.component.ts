import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core';
import { CommunicationService } from '@core';
import { Location } from '@angular/common';

// --- Interfaces ---
interface Category { id: string; name: string; code: string; }
interface Subcategory { id: string; subcategoryName: string; subcategoryCode: string; }
interface RawItem { id: string; itemName: string; code: string; stockUnit?: string; photo1?: string; photo2?: string; }

@Component({
  selector: 'app-add-product-bom',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-product-bom.component.html',
  styleUrl: './add-product-bom.component.scss'
})
export class AddProductBomComponent implements OnInit {

  product: any;
  productId: any;
  bomId: string | null = null;
  isUpdateMode: boolean = false;
  manufacturerEmail: string = '';

  activeColorIndex: number = 0;
  loading = false;
  showModal: boolean = false;

  // Master Data
  categories: Category[] = [];
  stockUnits: string[] = ['kg', 'gram', 'liter', 'ml', 'nos', 'pieces', 'meter', 'foot', 'cm', 'inch', 'box', 'packet', 'dozen', 'ton'];

  // Modal State
  currentSelectingRowIndex: number = -1;
  currentSelectingSizeIndex: number = -1;
  currentSelectingColorIndex: number = -1;
  availableRawItems: RawItem[] = [];

  rowSuboptions: any[][][] = [];
  bomForm: FormGroup;

  // Modal Pagination State
  modalPage: number = 1;
  modalLimit: number = 10;
  modalTotal: number = 0;
  modalCategoryId: string = '';
  modalSubcategoryId: string = '';

  // Image Preview State
  previewImageSrc: string | null = null;
  showImageModal: boolean = false;

  math = Math;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private comms: CommunicationService,
    private location: Location
  ) {
    this.bomForm = this.fb.group({
      colors: this.fb.array([])
    });
  }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.manufacturerEmail = user.email || '';

    // Always start by getting the Product ID from URL
    // Supports both /add-bom/PRODUCT_ID and /add-bom?productId=PRODUCT_ID
    const routeParamId = this.route.snapshot.paramMap.get('id');
    const queryParamId = this.route.snapshot.queryParamMap.get('productId') || this.route.snapshot.queryParamMap.get('id');

    this.productId = routeParamId || queryParamId;

    if (this.productId) {
      this.loadProductData();
    } else {
      console.error('No Product ID found in URL');
    }

    this.loadCategories();
  }

  goBack() {
    this.location.back();
  }

  // --- Data Loading ---

  loadProductData() {
    console.log('Loading Product:', this.productId);
    this.loading = true;

    this.authService.get(`type2-products/${this.productId}`).subscribe({
      next: (res: any) => {
        this.product = res;
        if (!this.product) {
          console.warn('Product data is null');
          this.loading = false;
          return;
        }

        console.log('Product Loaded:', this.product.productTitle);

        // 1. Initialize Form Structure based on Product
        this.initFormStructure();

        // 2. CHECK IF BOM IS ALREADY FILLED
        if (this.product.bomFilled === true && this.product.bomId) {
          console.log('BOM exists! Switching to Edit Mode. BOM ID:', this.product.bomId);
          this.isUpdateMode = true;
          this.bomId = this.product.bomId;

          // 3. Load BOM Data to Patch
          this.loadBom(this.bomId!);
        } else {
          console.log('No BOM found. Staying in Create Mode.');
          this.loading = false;
        }
      },
      error: (err: any) => {
        console.error('API Error Loading Product:', err);
        this.loading = false;
      }
    });
  }

  loadBom(id: string) {
    console.log('Fetching BOM Data...');
    this.authService.get(`manufacture-bom/${id}`).subscribe({
      next: (res: any) => {
        const bomData = res.data || res;
        console.log('BOM Data Received:', bomData);

        this.patchBomData(bomData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading BOM', err);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.authService.get(`manufacture-category?limit=1000&manufacturerEmail=${this.manufacturerEmail}`).subscribe({
      next: (res: any) => { this.categories = res.data?.results || []; }
    });
  }

  loadSubcategories(categoryId: string): Promise<Subcategory[]> {
    return new Promise((resolve) => {
      this.authService.get(`manufacture-subcategory?categoryId=${categoryId}&limit=1000&manufacturerEmail=${this.manufacturerEmail}`).subscribe({
        next: (res: any) => { resolve(res.data?.results || []); },
        error: () => resolve([])
      });
    });
  }

  // --- Form Structure & Patching ---

  get colorsArray(): FormArray { return this.bomForm.get('colors') as FormArray; }
  getSizesArray(cIdx: number): FormArray { return this.colorsArray.at(cIdx).get('sizes') as FormArray; }
  getMaterialsArray(cIdx: number, sIdx: number): FormArray { return this.getSizesArray(cIdx).at(sIdx).get('materials') as FormArray; }

  initFormStructure() {
    this.colorsArray.clear();
    const colorGroups = this.product.colourCollections || [];

    colorGroups.forEach((colorData: any, cIndex: number) => {
      const sizeGroups = this.product.sizes || [];
      const sizesArray = this.fb.array([]);

      sizeGroups.forEach((sizeData: any) => {
        const sizeGroup = this.fb.group({
          size: [sizeData.standardSize],
          sizeId: [sizeData._id],
          notes: [''],
          materials: this.fb.array([])
        });
        (sizesArray as FormArray).push(sizeGroup);
      });

      const colorGroup = this.fb.group({
        colorName: [colorData.colourName],
        colorCode: [colorData.colour],
        sizes: sizesArray
      });

      (this.colorsArray as FormArray).push(colorGroup);
    });
  }

  patchBomData(bomData: any) {
    if (!bomData.colors) return;

    bomData.colors.forEach((cData: any) => {
      // Find the matching color group in our form (by name)
      // We use .value.colorName because controls is an array of FormGroups
      const formColorIndex = this.colorsArray.controls.findIndex(c =>
        c.value.colorName?.toLowerCase() === cData.color?.toLowerCase()
      );

      if (formColorIndex === -1) return; // Color in BOM not found in Product?

      const formColorGroup = this.colorsArray.at(formColorIndex);

      cData.sizes.forEach((sData: any) => {
        // Find matching size group
        const formSizeArray = formColorGroup.get('sizes') as FormArray;
        const formSizeIndex = formSizeArray.controls.findIndex(s =>
          s.value.size === sData.size
        );

        if (formSizeIndex === -1) return;

        const formSizeGroup = formSizeArray.at(formSizeIndex);
        formSizeGroup.patchValue({ notes: sData.notes });

        const materialsArray = formSizeGroup.get('materials') as FormArray;
        materialsArray.clear();

        sData.materials.forEach((mData: any, mIdx: number) => {
          // Create Material Group
          const mGroup = this.fb.group({
            categoryId: [mData.categoryCode, Validators.required],
            subcategoryId: [mData.subcategoryCode, Validators.required],
            rawItemId: ['EXISTING', Validators.required],

            categoryName: [mData.categoryName],
            subcategoryName: [mData.subcategoryName],
            itemName: [mData.materialName],
            itemCode: [mData.materialCode],

            photo1: [mData.photo1 || ''], 
            photo2: [mData.photo2 || ''], 

            qty: [mData.qtyPerPiece, [Validators.required, Validators.min(0)]],
            unit: [mData.uom, Validators.required],
            quantityParameter: [mData.quantityParameter],
            wastagePercent: [mData.wastagePercent],
            note: [mData.details]
          });

          // Pre-load subcategories for this row so dropdown shows correct list
          this.loadSubcategories(mData.categoryCode).then(subs => {
            if (!this.rowSuboptions[formColorIndex]) this.rowSuboptions[formColorIndex] = [];
            if (!this.rowSuboptions[formColorIndex][formSizeIndex]) this.rowSuboptions[formColorIndex][formSizeIndex] = [];
            this.rowSuboptions[formColorIndex][formSizeIndex][mIdx] = subs;
          });

          materialsArray.push(mGroup);
        });
      });
    });
  }

  // --- Validation ---

  isFormValid(): boolean {
    if (this.bomForm.invalid) return false;
    // Iterate all sizes - ensure at least one material per size
    for (let c of this.colorsArray.controls) {
      const sizes = c.get('sizes') as FormArray;
      for (let s of sizes.controls) {
        const materials = s.get('materials') as FormArray;
        if (materials.length === 0) return false;
      }
    }
    return true;
  }

  // --- UI Actions ---
  setActiveTab(idx: number) { this.activeColorIndex = idx; }

  addMaterialRow(colorIndex: number, sizeIndex: number) {
    const materials = this.getMaterialsArray(colorIndex, sizeIndex);
    materials.push(this.fb.group({
      categoryId: ['', Validators.required],
      subcategoryId: ['', Validators.required],
      rawItemId: ['TEMP_ID', Validators.required],
      categoryName: [''], subcategoryName: [''], itemName: [''], itemCode: [''],

      // NEW: Photo Controls
      photo1: [''],
      photo2: [''],

      qty: [null, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      quantityParameter: [''], wastagePercent: [0], note: ['']
    }));
  }


  removeMaterialRow(cIdx: number, sIdx: number, mIdx: number) { this.getMaterialsArray(cIdx, sIdx).removeAt(mIdx); }

  onTableCategoryChange(cIdx: number, sIdx: number, mIdx: number, catId: any) {
    const row = this.getMaterialsArray(cIdx, sIdx).at(mIdx);
    const cat = this.categories.find(c => c.id === catId);
    row.patchValue({ categoryName: cat?.name || '', subcategoryId: '', rawItemId: '', itemName: '' });

    if (!this.rowSuboptions[cIdx]) this.rowSuboptions[cIdx] = [];
    if (!this.rowSuboptions[cIdx][sIdx]) this.rowSuboptions[cIdx][sIdx] = [];

    this.loadSubcategories(catId).then(subs => {
      this.rowSuboptions[cIdx][sIdx][mIdx] = subs;
    });
  }

  onTableSubCategoryChange(cIdx: number, sIdx: number, mIdx: number, subId: any) {
    const row = this.getMaterialsArray(cIdx, sIdx).at(mIdx);
    const subs = this.rowSuboptions[cIdx][sIdx][mIdx] || [];
    const sub = subs.find((s: any) => s.id === subId);
    row.patchValue({ subcategoryName: sub?.subcategoryName || '', rawItemId: '', itemName: '' });
  }

  closeItemModal() { this.showModal = false; }

  selectItemFromModal(item: RawItem) {
    const row = this.getMaterialsArray(this.currentSelectingColorIndex, this.currentSelectingSizeIndex).at(this.currentSelectingRowIndex);

    // Patch photos into the form control (ensure you add photo1/photo2 to form group creation if strict)
    // OR just use patchValue and ensure the form group has these controls
    row.patchValue({
      rawItemId: item.id,
      itemName: item.itemName,
      itemCode: item.code,
      unit: item.stockUnit,
      // Add photo data to form (will need to add controls to addMaterialRow)
      photo1: item.photo1 || '',
      photo2: item.photo2 || '' // Assuming item has photo2
    });
    this.closeItemModal();
  }

  copyToAllSizes(cIdx: number, sourceSizeIdx: number) {
    if (!confirm("Overwrite all other sizes?")) return;
    const sourceMaterials = this.getMaterialsArray(cIdx, sourceSizeIdx);
    const sizeArray = this.getSizesArray(cIdx);

    for (let s = 0; s < sizeArray.length; s++) {
      if (s === sourceSizeIdx) continue;
      const targetMaterials = this.getMaterialsArray(cIdx, s);
      targetMaterials.clear();
      for (let i = 0; i < sourceMaterials.length; i++) {
        const sourceRow = sourceMaterials.at(i);
        targetMaterials.push(this.fb.group(sourceRow.value));
        if (!this.rowSuboptions[cIdx][s]) this.rowSuboptions[cIdx][s] = [];
        this.rowSuboptions[cIdx][s][i] = this.rowSuboptions[cIdx][sourceSizeIdx][i];
      }
    }
  }

  // 1. UPDATE: loadRawItems to handle pagination
  loadRawItems(categoryId: string, subcategoryId: string, page: number = 1) {
    this.modalCategoryId = categoryId;
    this.modalSubcategoryId = subcategoryId;
    this.modalPage = page;
    this.loading = true;

    const payload = {
      categoryId,
      subcategoryId,
      page: this.modalPage,
      limit: this.modalLimit
    };

    this.authService.post(`manufacture-item/filter`, payload).subscribe({
      next: (res: any) => {
        this.availableRawItems = res.data?.results || [];
        this.modalTotal = res.data?.totalResults || 0; // Capture total for pagination
        this.loading = false;
        this.showModal = true;
      },
      error: () => { this.loading = false; }
    });
  }

  // 2. NEW: Pagination Event
  onModalPageChange(newPage: number) {
    if (newPage < 1) return;
    // Calculate max page
    const maxPage = Math.ceil(this.modalTotal / this.modalLimit);
    if (newPage > maxPage && maxPage > 0) return;

    this.loadRawItems(this.modalCategoryId, this.modalSubcategoryId, newPage);
  }

  // 3. UPDATE: openItemModal to use the new load method
  openItemModal(cIdx: number, sIdx: number, mIdx: number) {
    const row = this.getMaterialsArray(cIdx, sIdx).at(mIdx);
    const catId = row.value.categoryId;
    const subId = row.value.subcategoryId;

    if (!catId || !subId) { alert("Please select Category and Subcategory first."); return; }

    this.currentSelectingColorIndex = cIdx;
    this.currentSelectingSizeIndex = sIdx;
    this.currentSelectingRowIndex = mIdx;

    // Reset to page 1
    this.loadRawItems(catId, subId, 1);
  }

  openImagePreview(src: string) {
    if (!src) return;
    this.previewImageSrc = src;
    this.showImageModal = true;
  }

  closeImagePreview() {
    this.showImageModal = false;
    this.previewImageSrc = null;
  }

  // --- Submit & Update Logic ---

  submitBOM() {
    if (!this.isFormValid()) {
      alert("Please ensure EVERY size has at least one raw material and all fields are filled.");
      return;
    }

    this.loading = true;
    const formVal = this.bomForm.value;

    // Construct Payload
    const bomPayload = {
      productId: this.productId,
      manufacturerEmail: this.manufacturerEmail,
      designNumber: this.product.designNumber,
      colors: formVal.colors.map((c: any) => ({
        color: c.colorName,
        sizes: c.sizes.map((s: any) => ({
          size: s.size,
          notes: s.notes,
          materials: s.materials.map((m: any) => ({
            materialName: m.itemName,
            materialCode: m.itemCode || 'N/A',
            categoryName: m.categoryName,
            categoryCode: m.categoryId,
            subcategoryName: m.subcategoryName,
            subcategoryCode: m.subcategoryId,
            uom: m.unit,
            qtyPerPiece: m.qty,
            wastagePercent: m.wastagePercent,
            quantityParameter: 'N/A',
            details: m.note,
            photo1: m.photo1,
            photo2: m.photo2
          }))
        }))
      }))
    };

    if (this.isUpdateMode && this.bomId) {
      // --- UPDATE FLOW ---
      console.log('Updating Existing BOM:', this.bomId);
      this.authService.patchpimage(`manufacture-bom/${this.bomId}`, bomPayload).subscribe({
        next: (res) => {
          this.loading = false;
          alert('✅ BOM Updated Successfully!');
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert('Failed to update BOM');
        }
      });

    } else {
      // --- CREATE FLOW ---
      console.log('Creating New BOM');
      this.authService.post('manufacture-bom', bomPayload).subscribe({
        next: (res: any) => {
          const createdBomId = res.data?.id || res.data?._id;

          // Update Product Flag AND ID
          const productUpdatePayload = {
            bomFilled: true,
            bomId: createdBomId
          };

          this.authService.patchpimage(`type2-products/${this.productId}`, productUpdatePayload).subscribe({
            next: () => {
              this.loading = false;
              alert('BOM Created & Product Updated!');

              // Switch to Edit Mode immediately
              if (createdBomId) {
                this.isUpdateMode = true;
                this.bomId = createdBomId;
              }
            },
            error: () => {
              this.loading = false;
              alert('BOM saved, but Product Status update failed.');
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          alert('Failed to create BOM.');
        }
      });
    }
  }
}
