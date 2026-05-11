import { CommonModule, Location, NgFor, NgIf, NgStyle, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-cp-mfg-product-view',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor, NgStyle,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe
  ],
  templateUrl: './cp-mfg-product-view.component.html',
  styleUrl: './cp-mfg-product-view.component.scss'
})
export class CpMfgProductViewComponent {

  @ViewChild('mainImage') mainImage!: ElementRef;

  // ── User & route ──────────────────────────────
  currentUser: any;
  productId = '';
  manufacturerEmail = '';
  manufacturerCompanyName = '';

  // ── Product data ──────────────────────────────
  product: any = null;
  colours: any[] = [];
  productType: any;
  hsnCode: any;
  hsnGst: any;
  designno: any;

  // ── Media ─────────────────────────────────────
  selectedMedia: any;
  selectedMediaType = 'image';

  // ── Colour ────────────────────────────────────
  selectedColourCollection: any = null;
  selectedColourName = '';
  hoveredColourName = '';

  // ── Size / Price picker ───────────────────────
  selectedColor: any = null;
  selectedSize = '';
  selectedQuantity = 1;
  calculatedPrice = 0;
  calculatedMrp = 0;
  availableSizes: string[] = [];

  // ── Temp cart ─────────────────────────────────
  tempCart: Array<{
    colourName: string;
    size: string;
    quantity: number;
    price: any;
    mrp: any;
    designNumber: any;
    colour: any;
    colourImage: any;
    hsnCode: any;
    hsnGst: any;
    brandName: any;
  }> = [];

  // ── Shopkeeper ────────────────────────────────
  shopkeeperEmail = '';
  shopkeeperEmailError = '';

  // ── Shopkeeper Search ─────────────────────────
  shopkeeperSearch = '';
  shopkeeperResults: any[] = [];
  shopkeeperSearchLoading = false;
  selectedShopkeeper: any = null;
  showShopkeeperDropdown = false;
  private searchTimeout: any = null;

  constructor(
    private location: Location,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private viewportScroller: ViewportScroller,
    public authService: AuthService,
    private communicationService: CommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.getProductDetails(this.productId);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.manufacturerEmail = params['manufacturerEmail'] || '';
      this.manufacturerCompanyName = params['companyName'] || '';
      // If shopkeeperEmail was passed as query param (future use)
      this.shopkeeperEmail = params['shopkeeperEmail'] || '';
    });
  }

  // ── Product Details ───────────────────────────
  getProductDetails(id: any): void {
    this.authService.get('type2-products/' + id).subscribe({
      next: (res: any) => {
        if (!res) return;
        this.productType = res.productType;
        this.hsnCode = res.hsnCode;
        this.hsnGst = res.hsnGst;
        this.designno = res.designNumber;

        this.product = {
          id: res.id,
          productBy: res.productBy,
          brand: res.brand,
          designNumber: res.designNumber,
          clothingType: res.clothing,
          subCategory: res.subCategory,
          gender: res.gender,
          FSIN: res.FSIN,
          hsnCode: res.hsnCode,
          hsnGst: res.hsnGst,
          title: res.productTitle,
          description: res.productDescription,
          material: res.material,
          materialVariety: res.materialvariety,
          pattern: res.fabricPattern,
          fitType: res.fitStyle,
          occasion: res.selectedOccasion?.join(', ') || '',
          lifestyle: res.selectedlifeStyle?.join(', ') || '',
          closureType: res.closureType,
          pocketDescription: res.pocketDescription,
          sleeveCuffStyle: res.sleeveCuffStyle,
          neckCollarStyle: res.neckStyle,
          specialFeatures: res.specialFeature?.join(', ') || '',
          careInstructions: res.careInstructions,
          sizes: res.sizes?.map((size: any) => ({
            standardSize: size.standardSize,
            brandSize: size.brandSize,
            chestSize: size.chestSize,
            frontLength: size.frontLength,
            neckSize: size.neckSize,
            shoulderSize: size.shoulderSize,
            RtlPrice: size.RtlPrice,
            singleMRP: size.singleMRP,
            manufacturerPrice: size.manufacturerPrice,
          })) || [],
          colours: res.colourCollections?.map((colour: any) => ({
            name: colour.colourName,
            hex: colour.colour,
            image: colour.colourImage,
            images: colour.productImages,
            video: colour.productVideo
          })) || [],
          availability: res.quantity > 0 ? `${res.quantity} (In Stock)` : 'Out of Stock'
        };

        this.colours = this.product.colours;
        this.selectColourCollection(this.product.colours[0]);
      },
      error: () => {
        this.communicationService.customError1('Unable to load product details');
      }
    });
  }

  // ── Media ─────────────────────────────────────
  selectColourCollection(colour: any): void {
    if (!colour) return;
    this.selectedColourCollection = colour;
    this.selectedColourName = colour.name;
    const media = [
      ...colour.images.map((image: string) => ({ type: 'image', src: image })),
      colour.video ? { type: 'video', src: colour.video } : null
    ].filter(m => m && m.src);
    this.product.media = media;
    this.selectedMedia = media[0]?.src;
    this.selectedMediaType = media[0]?.type || 'image';
  }

  changeMainMedia(media: any): void {
    this.selectedMedia = media.src;
    this.selectedMediaType = media.type;
  }

  onHoverColour(colour: any): void {
    this.hoveredColourName = this.selectedColourName;
    this.selectedColourName = colour.name;
  }

  onLeaveColour(): void {
    this.selectedColourName = this.hoveredColourName;
  }

  // ── Image Zoom ────────────────────────────────
  zoomImage(event: MouseEvent): void {
    const el = this.mainImage?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'transform', `scale(1.8)`);
    this.renderer.setStyle(el, 'cursor', 'zoom-in');
    this.renderer.setStyle(el, 'transform-origin', `${event.offsetX}px ${event.offsetY}px`);
  }

  resetZoom(): void {
    const el = this.mainImage?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'transform', 'none');
    this.renderer.setStyle(el, 'cursor', 'default');
  }

  // ── Size / Price ──────────────────────────────
  onColorChange(): void {
    this.availableSizes = this.product?.sizes.map((size: any) => size.standardSize) || [];
    this.selectedSize = '';
    this.calculatedPrice = 0;
    this.calculatedMrp = 0;
  }

  onSizeChange(): void {
    if (this.selectedSize) {
      this.calculatedPrice = this.getPriceBySize(this.selectedSize);
      this.calculatedMrp = this.getMrpBySize(this.selectedSize);
    }
  }

  getPriceBySize(size: string): number {
    const pricing = this.product?.sizes.find((s: any) => s.standardSize === size);
    return pricing ? +pricing.RtlPrice : 0;
  }

  getMrpBySize(size: string): number {
    const pricing = this.product?.sizes.find((s: any) => s.standardSize === size);
    return pricing ? +pricing.singleMRP : 0;
  }

  // ── Temp Cart ─────────────────────────────────
  addItem(): void {
    if (!this.selectedColor || !this.selectedSize || !this.selectedQuantity) {
      this.communicationService.customError1('Please select Color, Size and Quantity.');
      return;
    }

    const price = this.getPriceBySize(this.selectedSize);
    const mrp = this.getMrpBySize(this.selectedSize);
    const matchedColor = this.colours.find((c: any) => c.name.toLowerCase() === this.selectedColor.toLowerCase());

    const existingItem = this.tempCart.find(
      item => item.colourName === this.selectedColor && item.size === this.selectedSize
    );

    if (existingItem) {
      existingItem.quantity += this.selectedQuantity;
    } else {
      this.tempCart.push({
        colourName: this.selectedColor,
        size: this.selectedSize,
        quantity: this.selectedQuantity,
        price: price.toString(),
        mrp: mrp.toString(),
        designNumber: this.designno,
        colour: matchedColor?.hex || '',
        colourImage: matchedColor?.image || '',
        hsnCode: this.hsnCode,
        hsnGst: this.hsnGst,
        brandName: this.product.brand,
      });
    }

    this.selectedSize = '';
    this.selectedQuantity = 1;
    this.calculatedPrice = 0;
    this.calculatedMrp = 0;

    setTimeout(() => {
      const pos = this.viewportScroller.getScrollPosition();
      this.viewportScroller.scrollToPosition([pos[0], pos[1] + 500]);
    }, 100);
  }

  removeItem(index: number): void {
    this.tempCart.splice(index, 1);
  }

  getCartTotal(): number {
    return this.tempCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  }

onShopkeeperSearch(): void {
  clearTimeout(this.searchTimeout);

  if (!this.shopkeeperSearch || this.shopkeeperSearch.trim().length < 2) {
    this.shopkeeperResults = [];
    this.showShopkeeperDropdown = false;
    return;
  }

  this.searchTimeout = setTimeout(() => {
    this.shopkeeperSearchLoading = true;
    this.showShopkeeperDropdown = true;

    const body = {
      search: this.shopkeeperSearch.trim(),
      filter: { status: 'active' },
      options: { page: 1, limit: 10, sortBy: 'createdAt:desc' }
    };

    this.authService.post('channel-partner-customers/search', body).subscribe({
      next: (res: any) => {
        this.shopkeeperResults = res?.data?.results || []; // ← fix here
        this.shopkeeperSearchLoading = false;
      },
      error: () => {
        this.shopkeeperResults = [];
        this.shopkeeperSearchLoading = false;
        this.communicationService.customError1('Unable to search shopkeepers');
      }
    });
  }, 400);
}

selectShopkeeper(shopkeeper: any): void {
  this.selectedShopkeeper = shopkeeper;
  this.shopkeeperEmail = shopkeeper.email;
  this.shopkeeperSearch = shopkeeper.shopName || shopkeeper.fullName || shopkeeper.email;
  this.showShopkeeperDropdown = false;
  this.shopkeeperResults = [];
  this.shopkeeperEmailError = '';
}

clearShopkeeper(): void {
  this.selectedShopkeeper = null;
  this.shopkeeperEmail = '';
  this.shopkeeperSearch = '';
  this.shopkeeperResults = [];
  this.showShopkeeperDropdown = false;
}

validateShopkeeperEmail(): boolean {
  if (!this.shopkeeperEmail || !this.selectedShopkeeper) {
    this.shopkeeperEmailError = 'Please search and select a shopkeeper before adding to cart.';
    return false;
  }
  this.shopkeeperEmailError = '';
  return true;
}

  // ── Add to Cart (CP Cart API) ─────────────────
  async addToCart(): Promise<void> {
  if (!this.validateShopkeeperEmail()) return;

  if (this.tempCart.length === 0) {
    this.communicationService.customError1('Please add at least one item to the list first.');
    return;
  }

  if (!this.currentUser?.email) {
    this.communicationService.customError1('Session not found. Please login again.');
    return;
  }

  const payload = {
    cpEmail: this.currentUser.email,
    shopkeeperEmail: this.shopkeeperEmail,
    manufacturerEmail: this.manufacturerEmail || this.product?.productBy,
    manufacturerName: this.manufacturerCompanyName || '',
    items: this.tempCart.map(item => ({
      productId: this.product.id,
      designNumber: item.designNumber,
      colour: item.colour,
      colourName: item.colourName,
      colourImage: item.colourImage,
      size: item.size,
      quantity: item.quantity,
      price: parseFloat(item.price),
      mrp: parseFloat(item.mrp),
      hsnCode: item.hsnCode,
      hsnGst: item.hsnGst,
      brandName: item.brandName,
      productType: this.productType,
      gender: this.product.gender,
      clothing: this.product.clothingType,
      subCategory: this.product.subCategory,
    }))
  };

  try {
    await this.authService.post('cp-cart/add', payload).toPromise();
    this.communicationService.customSuccess1('Products added to cart successfully!');
    this.tempCart = [];
    this.selectedColor = null;
    this.selectedSize = '';
    this.calculatedPrice = 0;
    this.calculatedMrp = 0;
  } catch (error) {
    this.communicationService.customError1('Error adding to cart. Please try again.');
  }
}

  navigateFun(): void {
    this.location.back();
  }
}
