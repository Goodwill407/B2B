import { CommonModule, Location, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import ColorThief from 'colorthief';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-cp-mfg-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgStyle, RouterModule, PaginatorModule],
  templateUrl: './cp-mfg-product-list.component.html',
  styleUrl: './cp-mfg-product-list.component.scss'
})
export class CpMfgProductListComponent {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    category: '',
    subCategory: '',
  };

  products: any[] = [];
  allBrand: any[] = [];
  allGender = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  allProductType: any[] = [];
  allSubCategory: any[] = [];
  allcategory: any[] = [];
  limit = 10;
  page = 1;
  first = 0;
  rows = 10;
  totalResults = 0;
  manufacturerEmail = '';
  manufacturerCompanyName = '';
  hoverIntervals: any = {};

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.manufacturerEmail = params['manufacturerEmail'] || '';
      this.manufacturerCompanyName = params['companyName'] || '';

      if (!this.manufacturerEmail) {
        this.communicationService.customError1('Manufacturer details not found');
        return;
      }

      this.getAllProducts();
      this.getAllBrands();
      this.getAllProductTypes();
    });
  }

  ngOnDestroy(): void {
    this.clearHoverIntervals();
  }

  getAllBrands(): void {
    this.authService.get(`brand?brandOwner=${this.manufacturerEmail}`).subscribe({
      next: (res: any) => {
        this.allBrand = res?.results || [];
      }
    });
  }

  getAllProducts(): void {
    const body = {
      limit: this.limit,
      page: this.page,
      productBy: this.manufacturerEmail,
      brand: this.filters.brand,
      productType: this.filters.productType,
      gender: this.filters.gender,
      clothing: this.filters.category,
      subCategory: this.filters.subCategory,
    };

    this.authService.post('type2-products/filter-products', body).subscribe({
      next: (res: any) => {
        this.totalResults = res?.totalResults || 0;
        this.products = (res?.results || []).map((product: any) => ({
        id: product.id,
        designNo: product.designNumber,
        selectedImageUrl: product.colourCollections?.[0]?.productImages?.[0] 
          || 'assets/images/Product_Alt.jpeg',        // ← fallback here
        selectedImageUrls: product.colourCollections?.[0]?.productImages?.length
          ? product.colourCollections[0].productImages
          : ['assets/images/Product_Alt.jpeg'],        // ← fallback array too
        title: product.productTitle,
        description: product.productDescription,
        selectedColor: product.colourCollections?.[0]?.colour || '',
        colors: product.colourCollections?.map((c: any) => c.colour) || [],
        colourCollections: product.colourCollections || [],
        hoverIndex: 0,
      }));

        this.products.forEach((product) => {
          if (!product.selectedColor && product.selectedImageUrl) {
            this.extractColorFromImage(product);
          }
        });
      },
      error: () => {
        this.products = [];
        this.totalResults = 0;
        this.communicationService.customError1('Unable to load products');
      }
    });
  }

  getAllProductTypes(): void {
    this.authService.get('sub-category').subscribe((res: any) => {
      if (res) {
        this.allProductType = Array.from(new Set(res.results.map((item: any) => item.productType)));
      }
    });
  }

  getCategoryByProductTypeAndGender(): void {
  // Reset downstream filters when productType or gender changes
  this.filters.category = '';
  this.filters.subCategory = '';
  this.allcategory = [];
  this.allSubCategory = [];

  if (!this.filters.productType && !this.filters.gender) return;

  this.authService
    .get(
      `sub-category/get-category/by-gender?productType=${this.filters.productType}&gender=${this.filters.gender}`
    )
    .subscribe({
      next: (res: any) => {
        this.allcategory = Array.from(
          new Set((res?.results || []).map((item: any) => item.category))
        );
      },
    });
}

getSubCategoryBYProductType_Gender_and_Category(): void {
  // Reset sub-category when category changes
  this.filters.subCategory = '';
  this.allSubCategory = [];

  if (!this.filters.category) return;

  const body = {
    productType: this.filters.productType,
    gender: this.filters.gender,
    category: this.filters.category,
  };

  this.authService.post('sub-category/filter', body).subscribe({
    next: (res: any) => {
      this.allSubCategory = Array.from(
        new Set((res?.results || []).map((item: any) => item.subCategory))
      );
    },
  });
}

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.first = event.first;
    this.rows = event.rows;
    this.getAllProducts();
  }

  disableImage(product: any, color: string): boolean {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    return !(selectedColor?.productImages?.length > 0);
  }

  navigateToImage(product: any, index: number): void {
    product.hoverIndex = index;
    product.selectedImageUrl = product.selectedImageUrls[index];
  }

  onMouseEnter(product: any): void {
    if (!product.selectedImageUrls?.length) return;
    this.hoverIntervals[product.id] = setInterval(() => {
      this.slideNextImage(product);
    }, 1000);
  }

  onMouseLeave(product: any): void {
    clearInterval(this.hoverIntervals[product.id]);
  }

  slideNextImage(product: any): void {
    if (!product.selectedImageUrls?.length) return;
    const nextIndex = (product.hoverIndex + 1) % product.selectedImageUrls.length;
    product.hoverIndex = nextIndex;
    product.selectedImageUrl = product.selectedImageUrls[nextIndex];
  }

  changeProductImage(product: any, color: string): void {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor) {
      product.selectedImageUrls = selectedColor.productImages || [];
      product.selectedColor = color;
      product.selectedImageUrl = product.selectedImageUrls?.[0] || product.selectedImageUrl;
      product.hoverIndex = 0;
    }
  }

  extractColorFromImage(product: any): void {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = product.selectedImageUrl;

    image.onload = () => {
      const colorThief = new ColorThief();
      const color = colorThief.getColor(image);
      product.selectedColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    };
  }

  clearHoverIntervals(): void {
    for (const key in this.hoverIntervals) {
      clearInterval(this.hoverIntervals[key]);
    }
  }

  openProduct(product: any): void {
    this.router.navigate(['/cp/cp-mfg-product-view', product.id], {
      queryParams: {
        manufacturerEmail: this.manufacturerEmail,
        companyName: this.manufacturerCompanyName
      }
    });
  }

  navigateFun(): void {
    this.location.back();
  }
}