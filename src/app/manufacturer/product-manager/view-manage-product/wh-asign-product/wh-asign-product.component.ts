import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-wh-asign-product',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    PaginatorModule
  ],
  templateUrl: './wh-asign-product.component.html',
  styleUrl: './wh-asign-product.component.scss'
})
export class WhAsignProductComponent implements OnInit, OnDestroy {

  // ─── Active Tab ────────────────────────────────────────────
  activeTab: 'assign' | 'assigned' = 'assign';

  // ─── Filters (Assign Tab) ──────────────────────────────────
  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: ''
  };

  allBrand: any[] = [];
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allProductType: string[] = [];
  allcategory: string[] = [];
  allSubCategory: string[] = [];

  // ─── Products (Assign Tab) ─────────────────────────────────
  products: any[] = [];
  selectedProductIds: Set<string> = new Set();
  limit = 21;
  page = 1;
  first = 0;
  rows = 21;
  totalResults = 0;
  hoverIntervals: any = {};

  // ─── Wholesalers (Assign Tab) ──────────────────────────────
  wholesalers: any[] = [];
  selectedWholesalerEmails: Set<string> = new Set();
  wholesalerSearch = '';
  wholesalerPage = 1;
  wholesalerLimit = 6;

  // ─── Assigned Tab State ────────────────────────────────────
  assignedWholesalers: any[] = [];
  selectedAssignedWholesaler: any = null;
  assignedProducts: any[] = [];
  assignedTotalResults = 0;
  assignedPage = 1;
  assignedLimit = 21;
  assignedFirst = 0;
  assignedRows = 21;
  assignedWholesalerSearch = '';
  assignedAllCategory: string[] = [];
  assignedAllSubCategory: string[] = [];

  assignedFilters = {
    search: '',
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: ''
  };

  selectedForRemoval: Set<string> = new Set();
  isRemoving = false;

  // ─── UI State ──────────────────────────────────────────────
  isAssigning = false;
  userProfile: any;

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
  }

  ngOnInit(): void {
    this.getallProductTypes();
    this.getAllBrands();
    this.getAllWholesalers();
    this.getAllProducts();
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  // ─── Tab Switch ────────────────────────────────────────────
  switchTab(tab: 'assign' | 'assigned'): void {
    this.activeTab = tab;
    if (tab === 'assigned' && this.assignedWholesalers.length === 0) {
      this.loadAssignedWholesalers();
    }
  }

  // ══════════════════════════════════════════════════════════
  // ASSIGN TAB METHODS
  // ══════════════════════════════════════════════════════════

  getAllBrands(): void {
    this.authService.get(`brand?brandOwner=${this.userProfile.email}`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getallProductTypes(): void {
    this.authService.get(`sub-category`).subscribe((res: any) => {
      if (res) {
        this.allProductType = Array.from(new Set(res.results.map((item: any) => item.productType))) as string[];
      }
    });
  }

  getCategoryByProductTypeAndGender(): void {
    const { productType, gender } = this.filters;
    this.allSubCategory = [];
    this.filters.category = '';
    this.filters.subCategory = '';
    this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`)
      .subscribe((res: any) => {
        this.allcategory = Array.from(new Set(res.results.map((item: any) => item.category))) as string[];
      });
  }

  getSubCategoryBYProductType_Gender_and_Category(): void {
    const { productType, gender, category } = this.filters;
    this.filters.subCategory = '';
    this.authService.post(`sub-category/filter`, { productType, gender, category })
      .subscribe((res: any) => {
        this.allSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory))) as string[];
      });
  }

  getAllProducts(): void {
    const url = `type2-products/filter-products`;
    const body = {
      productBy: this.userProfile.email,
      brand: this.filters.brand,
      productType: this.filters.productType,
      gender: this.filters.gender,
      clothing: this.filters.category,
      subCategory: this.filters.subCategory,
      limit:this.limit,
      page:this.page
    };

    this.authService.post(url, body).subscribe((res: any) => {
      if (res) {
        this.totalResults = res.totalResults;
        this.products = res.results.map((product: any) => ({
          designNo: product.designNumber,
          selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
          selectedImageUrls: product.colourCollections[0]?.productImages || [],
          title: product.productTitle,
          description: product.productDescription,
          selectedColor: product.colourCollections[0]?.colour || '',
          colors: product.colourCollections.map((c: any) => c.colour),
          colourCollections: product.colourCollections,
          id: product.id,
          hoverIndex: 0
        }));

        this.products.forEach(product => {
          if (!product.selectedColor) this.extractColorFromImage(product);
        });
      }
    }, (error) => console.log(error));
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllProducts();
  }

  // ─── Product Selection ─────────────────────────────────────
  toggleProductSelection(productId: string): void {
    this.selectedProductIds.has(productId)
      ? this.selectedProductIds.delete(productId)
      : this.selectedProductIds.add(productId);
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProductIds.has(productId);
  }

  clearProductSelection(): void {
    this.selectedProductIds.clear();
  }

  get allCurrentPageSelected(): boolean {
    return this.products.length > 0 && this.products.every(p => this.selectedProductIds.has(p.id));
  }

  toggleSelectAllCurrentPage(): void {
    if (this.allCurrentPageSelected) {
      this.products.forEach(p => this.selectedProductIds.delete(p.id));
    } else {
      this.products.forEach(p => this.selectedProductIds.add(p.id));
    }
  }

  // ─── Wholesalers ───────────────────────────────────────────
  getAllWholesalers(): void {
    this.authService.get(
      `manufacturers/get-referred/manufactures?page=${this.wholesalerPage}&limit=${this.wholesalerLimit}&refByEmail=${this.userProfile.email}&searchKeywords=${this.wholesalerSearch}`
    ).subscribe((res: any) => {
      this.wholesalers = res.results || [];
    });
  }

  toggleWholesalerSelection(email: string): void {
    this.selectedWholesalerEmails.has(email)
      ? this.selectedWholesalerEmails.delete(email)
      : this.selectedWholesalerEmails.add(email);
  }

  isWholesalerSelected(email: string): boolean {
    return this.selectedWholesalerEmails.has(email);
  }

  removeWholesaler(email: string): void {
    this.selectedWholesalerEmails.delete(email);
  }

  get filteredWholesalers(): any[] {
    if (!this.wholesalerSearch.trim()) return this.wholesalers;
    const q = this.wholesalerSearch.toLowerCase();
    return this.wholesalers.filter(w =>
      w.fullName?.toLowerCase().includes(q) ||
      w.companyName?.toLowerCase().includes(q) ||
      w.email?.toLowerCase().includes(q)
    );
  }

  get selectedWholesalerObjects(): any[] {
    return this.wholesalers.filter(w => this.selectedWholesalerEmails.has(w.email));
  }

  // ─── Assign ────────────────────────────────────────────────
  canAssign(): boolean {
    return this.selectedProductIds.size > 0 && this.selectedWholesalerEmails.size > 0;
  }

  assignProducts(): void {
    if (!this.canAssign()) return;
    this.isAssigning = true;

    const payload = {
      wholesalerEmails: Array.from(this.selectedWholesalerEmails),
      productIds: Array.from(this.selectedProductIds)
    };

    this.authService.post('wholesaler-product-assignment/assign-multiple', payload).subscribe(
      (res: any) => {
        this.isAssigning = false;
        this.communicationService.showNotification(
          'snackbar-success',
          `${this.selectedProductIds.size} product(s) assigned to ${this.selectedWholesalerEmails.size} wholesaler(s) successfully!`,
          'bottom', 'center'
        );
        this.selectedProductIds.clear();
        // this.selectedWholesalerEmails.clear();
      },
      (err: any) => {
        this.isAssigning = false;
        this.communicationService.showNotification(
          'snackbar-danger',
          'Assignment failed. Please try again.',
          'bottom', 'center'
        );
      }
    );
  }

  // ══════════════════════════════════════════════════════════
  // ASSIGNED TAB METHODS
  // ══════════════════════════════════════════════════════════

  loadAssignedWholesalers(): void {
    this.authService.get(
      `manufacturers/get-referred/manufactures?page=1&limit=10&refByEmail=${this.userProfile.email}&searchKeywords=`
    ).subscribe((res: any) => {
      this.assignedWholesalers = res.results || [];
      if (this.assignedWholesalers.length > 0) {
        this.selectAssignedWholesaler(this.assignedWholesalers[0]);
      }
    });
  }

  getAssignedProducts(): void {
    if (!this.selectedAssignedWholesaler) return;

    const body: any = {
      wholesalerEmail: this.selectedAssignedWholesaler.email,
      limit: this.assignedLimit,
      page: this.assignedPage
    };

    if (this.assignedFilters.search) body.search = this.assignedFilters.search;
    if (this.assignedFilters.brand) body.brand = this.assignedFilters.brand;
    if (this.assignedFilters.productType) body.productType = this.assignedFilters.productType;
    if (this.assignedFilters.gender) body.gender = this.assignedFilters.gender;
    if (this.assignedFilters.category) body.clothing = this.assignedFilters.category;
    if (this.assignedFilters.subCategory) body.subCategory = this.assignedFilters.subCategory;

    this.authService.post('type2-products/manufacturer/wholesaler-products', body).subscribe(
      (res: any) => {
        this.assignedTotalResults = res.totalResults;
        this.assignedProducts = (res.results || []).map((p: any) => ({
          id: p._id || p.id,
          title: p.productTitle,
          brand: p.brand,
          productType: p.productType,
          designNo: p.designNumber,
          selectedImageUrl: p.colourCollections?.[0]?.productImages?.[0] || '',
          selectedImageUrls: p.colourCollections?.[0]?.productImages || [],
          selectedColor: p.colourCollections?.[0]?.colour || '',
          colors: p.colourCollections?.map((c: any) => c.colour) || [],
          colourCollections: p.colourCollections || [],
          description: p.productDescription,
          hoverIndex: 0
        }));
      },
      (err: any) => console.log(err)
    );
  }

  onAssignedPageChange(event: any): void {
    this.assignedFirst = event.first;
    this.assignedPage = event.page + 1;
    this.assignedLimit = event.rows;
    this.getAssignedProducts();
  }

  // Called on search input change — fetches max 6 matching wholesalers
onAssignedWholesalerSearch(): void {
  if (!this.assignedWholesalerSearch.trim()) {
    this.assignedWholesalers = [];
    return;
  }
  this.authService.get(
    `manufacturers/get-referred/manufactures?page=1&limit=6&refByEmail=${this.userProfile.email}&searchKeywords=${this.assignedWholesalerSearch}`
  ).subscribe((res: any) => {
    this.assignedWholesalers = res.results || [];
  });
}

// Override selectAssignedWholesaler — just store selection, don't auto-load
selectAssignedWholesaler(wholesaler: any): void {
  this.selectedAssignedWholesaler = wholesaler;
  this.selectedForRemoval.clear();
  this.assignedFilters = { search: '', brand: '', productType: '', gender: '', category: '', subCategory: '' };
  this.assignedAllCategory = [];
  this.assignedAllSubCategory = [];
  this.assignedProducts = [];        // clear previous results
  this.assignedTotalResults = 0;
}

// Clear selected wholesaler
clearAssignedWholesaler(): void {
  this.selectedAssignedWholesaler = null;
  this.assignedWholesalerSearch = '';
  this.assignedWholesalers = [];
  this.assignedProducts = [];
  this.assignedTotalResults = 0;
  this.selectedForRemoval.clear();
}

// Category cascade for assigned filters
getAssignedCategoryByProductTypeAndGender(): void {
  const { productType, gender } = this.assignedFilters;
  this.assignedAllSubCategory = [];
  this.assignedFilters.category = '';
  this.assignedFilters.subCategory = '';
  if (!productType && !gender) { this.assignedAllCategory = []; return; }
  this.authService.get(`sub-category/get-category/by-gender?productType=${productType}&gender=${gender}`)
    .subscribe((res: any) => {
      this.assignedAllCategory = Array.from(new Set(res.results.map((item: any) => item.category))) as string[];
    });
}

// Sub-category cascade for assigned filters
getAssignedSubCategory(): void {
  const { productType, gender, category } = this.assignedFilters;
  this.assignedFilters.subCategory = '';
  if (!category) { this.assignedAllSubCategory = []; return; }
  this.authService.post(`sub-category/filter`, { productType, gender, category })
    .subscribe((res: any) => {
      this.assignedAllSubCategory = Array.from(new Set(res.results.map((item: any) => item.subCategory))) as string[];
    });
}

  // ─── Remove / Unassign ─────────────────────────────────────
  toggleRemovalSelection(productId: string): void {
    this.selectedForRemoval.has(productId)
      ? this.selectedForRemoval.delete(productId)
      : this.selectedForRemoval.add(productId);
  }

  isSelectedForRemoval(productId: string): boolean {
    return this.selectedForRemoval.has(productId);
  }

  get allAssignedPageSelected(): boolean {
    return this.assignedProducts.length > 0 && this.assignedProducts.every(p => this.selectedForRemoval.has(p.id));
  }

  toggleSelectAllAssignedPage(): void {
    if (this.allAssignedPageSelected) {
      this.assignedProducts.forEach(p => this.selectedForRemoval.delete(p.id));
    } else {
      this.assignedProducts.forEach(p => this.selectedForRemoval.add(p.id));
    }
  }

  removeAssignedProducts(): void {
    if (!this.selectedForRemoval.size || !this.selectedAssignedWholesaler) return;
    this.isRemoving = true;

    const payload = {
      productIds: Array.from(this.selectedForRemoval),
      wholesalerEmail: this.selectedAssignedWholesaler.email
    };

    this.authService.post('wholesaler-product-assignment/remove', payload).subscribe(
      (res: any) => {
        this.isRemoving = false;
        this.communicationService.showNotification(
          'snackbar-success',
          `${this.selectedForRemoval.size} product(s) unassigned successfully!`,
          'bottom', 'center'
        );
        this.selectedForRemoval.clear();
        this.getAssignedProducts();
      },
      (err: any) => {
        this.isRemoving = false;
        this.communicationService.showNotification(
          'snackbar-danger',
          err?.error?.message || 'Failed to unassign products.',
          'bottom', 'center'
        );
      }
    );
  }

  // ─── Image Carousel ────────────────────────────────────────
  extractColorFromImage(product: any): void {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = product.selectedImageUrl || '/b2b/1727183682898-no-image.png';
    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image);
      product.selectedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.changeProductImage(product, product.selectedColor);
    };
  }

  navigateToImage(product: any, index: number): void {
    product.hoverIndex = index;
    product.selectedImageUrl = product.selectedImageUrls[index];
  }

  onMouseEnter(product: any): void {
    this.hoverIntervals[product.id] = setInterval(() => this.slideNextImage(product), 1000);
  }

  onMouseLeave(product: any): void {
    clearInterval(this.hoverIntervals[product.id]);
  }

  slideNextImage(product: any): void {
    const nextIndex = (product.hoverIndex + 1) % (product.selectedImageUrls.length || 1);
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.selectedImageUrls[nextIndex];
  }

  disableImage(product: any, color: string): boolean {
    const col = product.colourCollections.find((c: any) => c.colour === color);
    return !col || col.productImages.length === 0;
  }

  changeProductImage(product: any, color: string): void {
    const col = product.colourCollections.find((c: any) => c.colour === color);
    if (col) {
      product.selectedImageUrls = col.productImages;
      product.selectedColor = color;
    }
  }

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) clearInterval(this.hoverIntervals[key]);
  }
}