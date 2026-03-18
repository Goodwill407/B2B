import { CommonModule, Location, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-view-product2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe
  ],
  templateUrl: './view-product2.component.html',
  styleUrl: './view-product2.component.scss'
})
export class ViewProduct2Component {

  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
  selectedColor: any = null;
  gender: any;
  clothingType: any;
  colours: any;
  productType: any;
  hsnCode: any;
  hsnGst: any;
  hsnDescription: any;

  @ViewChild('mainImage') mainImage!: ElementRef;
  zoomed: boolean = false;

  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image';
  ProductId: any = '';
  selectedColourCollection: any = null;
  selectedColourName: string = '';
  stepThree!: FormGroup;
  selectedSizes: any[] = [];
  colourCollections: any[] = [];
  designno: any;
  mfgEmail: any;

  selectedSize: string = '';
  selectedQuantity: number = 1;
  calculatedPrice: number = 0;
  calculatedMrp: number = 0;
  availableSizes: string[] = [];

  tempCart: Array<{
    colourName: string;
    size: string;
    quantity: number;
    price: string;
    mrp: string;
    manufacturerPrice: string;
    designNumber: any;
    colour: any;
    colourImage: any;
    hsnCode: any;
    hsnGst: any;
    hsnDescription: any;
    brandName: any;
    subCategory: any;
    productType: any;
    gender: any;
    clothing: any;
    productBy: any;
  }> = [];

  constructor(
    private location: Location,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller,
    public authService: AuthService,
    private fb: FormBuilder,
    private communicationService: CommunicationService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.stepThree = this.fb.group({});
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.ProductId = id;
      if (id) {
        this.getProductDetails(id);
      }
    });
  }

  getProductDetails(id: any) {
    this.authService.get('type2-products/' + id).subscribe((res: any) => {
      this.designno = res.designNumber;
      this.productType = res.productType;
      this.gender = res.gender;
      this.clothingType = res.clothing;
      this.hsnCode = res.hsnCode;
      this.hsnGst = res.hsnGst;
      this.hsnDescription = res.hsnDescription;

      if (res) {
        this.mfgEmail = res.productBy;
        this.product = {
          id: res.id,
          productBy: res.productBy,
          brand: res.brand,
          designNumber: res.designNumber,
          clothingType: res.clothing,
          subCategory: res.subCategory,
          gender: res.gender,
          title: res.productTitle,
          description: res.productDescription,
          material: res.material,
          FSIN: res.FSIN,
          hsnGst: res.hsnGst,
          hsnCode: res.hsnCode,
          hsnDescription: res.hsnDescription,
          productType: res.productType,
          materialVariety: res.materialvariety,
          pattern: res.fabricPattern,
          fitType: res.fitStyle,
          occasion: res.selectedOccasion.join(', '),
          lifestyle: res.selectedlifeStyle.join(', '),
          closureType: res.closureType,
          pocketDescription: res.pocketDescription,
          sleeveCuffStyle: res.sleeveCuffStyle,
          neckCollarStyle: res.neckStyle,
          specialFeatures: res.specialFeature.join(', '),
          careInstructions: res.careInstructions,
          sizes: res.sizes.map((size: any) => ({
            standardSize: size.standardSize,
            brandSize: size.brandSize,
            chestSize: size.chestSize,
            frontLength: size.frontLength,
            neckSize: size.neckSize,
            shoulderSize: size.shoulderSize,
            manufacturerPrice: size.manufacturerPrice,
            RtlPrice: size.RtlPrice,
            singleMRP: size.singleMRP,
          })),
          colours: res.colourCollections.map((colour: any) => ({
            name: colour.colourName,
            hex: colour.colour,
            image: colour.colourImage,
            images: colour.productImages,
            video: colour.productVideo
          })),
          minimumOrderQty: res.minimumOrderQty,
          dimensions: res.productDimension,
          dateAvailable: res.dateOfListing ? new Date(res.dateOfListing).toLocaleDateString() : 'N/A',
          availability: res.quantity > 0 ? `${res.quantity}` : 'Out of Stock',
        };

        this.colourCollections = this.product.colours;
        this.colours = this.product.colours;
        this.selectedSizes = this.product.sizes;

        this.createFormControls2();
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
      }
      this.checkWishlist();
    });
  }

  navigateFun() {
    this.location.back();
  }

  getControlName(colourName: string, size: string): string {
    return `${this.sanitizeControlName(colourName)}_${size}`;
  }

  sanitizeControlName(colourName: string): string {
    return colourName.replace(/\s+/g, '_').toLowerCase();
  }

  createFormControls2() {
    if (this.product?.colours.length && this.product?.sizes.length) {
      this.product.colours.forEach((color: any) => {
        const sanitizedColorName = this.sanitizeControlName(color.name);
        this.product.sizes.forEach((size: any) => {
          const controlName = `${sanitizedColorName}_${size.standardSize}`;
          if (!this.stepThree.contains(controlName)) {
            this.stepThree.addControl(controlName, new FormControl(null));
          }
        });
      });
    }
  }

  updateRowTotal(colorName: string, sizeName: string) {
    // Reserved for future row-level logic
  }

  getRowTotal(colorName: string): number {
    let total = 0;
    this.product?.sizes.forEach((size: any) => {
      const controlName = this.getControlName(colorName, size.standardSize);
      const quantity = this.stepThree.get(controlName)?.value || 0;
      const sizePrice = size.manufacturerPrice ? Number(size.manufacturerPrice) : 0;
      if (!isNaN(quantity) && sizePrice) {
        total += quantity * sizePrice;
      }
    });
    return total;
  }

  changeMainMedia(media: any) {
    this.selectedMedia = media.src;
    this.selectedMediaType = media.type;
  }

  selectColourCollection(colour: any) {
    this.selectedColourCollection = colour;
    this.selectedColourName = colour.name;
    const media = [
      ...colour.images.map((image: string) => ({ type: 'image', src: image })),
      { type: 'video', src: colour.video }
    ].filter(media => media.src);
    this.product.media = media;
    this.selectedMedia = media[0]?.src;
    this.selectedMediaType = media[0]?.type;
  }

  WishlistAdd() {
    this.authService.post('type2-wishlist', {
      productId: this.ProductId,
      email: this.userProfile.email,
      productOwnerEmail: this.mfgEmail,
      productUser: 'wholesaler'
    }).subscribe(
      (res: any) => {
        this.checkWishlist();
        this.communicationService.customSuccess1('Product Added to Wishlist');
      },
      (err: any) => {
        this.wishlist = false;
        this.communicationService.customError1('Error Adding Product to Wishlist');
      }
    );
  }

  checkWishlist() {
    this.authService.get(
      'type2-wishlist/checkout/wishlist?productId=' + this.ProductId +
      '&email=' + this.userProfile.email +
      '&productOwnerEmail=' + this.mfgEmail
    ).subscribe((res: any) => {
      this.wishlist = res ? true : false;
    });
  }

  zoomImage(event: MouseEvent) {
    const imageElement = this.mainImage?.nativeElement;
    if (!imageElement) return;
    this.renderer.setStyle(imageElement, 'transform', `scale(1.8)`);
    this.renderer.setStyle(imageElement, 'cursor', 'zoom-in');
    this.renderer.setStyle(imageElement, 'transform-origin', `${event.offsetX}px ${event.offsetY}px`);
  }

  resetZoom(event: MouseEvent) {
    const imageElement = this.mainImage?.nativeElement;
    if (!imageElement) return;
    this.renderer.setStyle(imageElement, 'transform', 'none');
    this.renderer.setStyle(imageElement, 'cursor', 'default');
  }

  openImg(path: any, size: number) {
    this.dialog.open(ImageDialogComponent, {
      data: { path: path, width: size },
      width: '90%',
      height: '90%',
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  onHoverColour(colour: any) {
    this.hoveredColourName = this.selectedColourName;
    this.selectedColourName = colour.name;
  }

  onLeaveColour() {
    this.selectedColourName = this.hoveredColourName;
  }

  onColorChange() {
    this.availableSizes = this.product?.sizes.map((size: any) => size.standardSize);
    this.selectedSize = '';
    this.calculatedPrice = 0;
    this.calculatedMrp = 0;
  }

  getManufacturerPriceBySize(size: string): string {
    const sizeObj = this.product?.sizes.find((s: any) => s.standardSize === size);
    return sizeObj ? sizeObj.manufacturerPrice : '0';
  }

  getPriceBySize(size: string): number {
    const sizeObj = this.product?.sizes.find((s: any) => s.standardSize === size);
    return sizeObj ? Number(sizeObj.manufacturerPrice) : 0;
  }

  getMrpBySize(size: string): number {
    const sizeObj = this.product?.sizes.find((s: any) => s.standardSize === size);
    return sizeObj ? Number(sizeObj.singleMRP) : 0;
  }

  onSizeChange() {
    if (this.selectedSize) {
      this.calculatedPrice = this.getPriceBySize(this.selectedSize);
      this.calculatedMrp = this.getMrpBySize(this.selectedSize);
    }
  }

  addItem() {
    if (!this.selectedColor || !this.selectedSize || !this.selectedQuantity) {
      alert('Please select color, size and quantity.');
      return;
    }

    const matchedColor = this.colours.find(
      (c: { name: string }) => c.name.toLowerCase() === this.selectedColor.toLowerCase()
    );

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
        price: this.calculatedPrice.toString(),
        mrp: this.calculatedMrp.toString(),
        manufacturerPrice: this.getManufacturerPriceBySize(this.selectedSize),
        designNumber: this.designno,
        colour: matchedColor?.hex || '',
        colourImage: matchedColor?.image || '',
        hsnCode: this.hsnCode,
        hsnGst: this.hsnGst,
        hsnDescription: this.hsnDescription,
        brandName: this.product.brand,
        subCategory: this.product.subCategory,
        productType: this.productType,
        gender: this.gender,
        clothing: this.clothingType,
        productBy: this.product.productBy,
      });
    }

    // Reset selections
    this.selectedSize = '';
    this.selectedQuantity = 1;
    this.calculatedPrice = 0;
    this.calculatedMrp = 0;

    // Smooth scroll down to cart table
    setTimeout(() => {
      const currentPosition = this.viewportScroller.getScrollPosition();
      this.viewportScroller.scrollToPosition([currentPosition[0], currentPosition[1] + 500]);
    }, 100);
  }

  removeItem(index: number) {
    this.tempCart.splice(index, 1);
  }

  async addToCartArray() {
    if (this.tempCart.length === 0) {
      this.communicationService.customError1('Please add at least one item to the cart.');
      return;
    }

    const payload = {
      productBy: this.product.productBy,           // Manufacturer email
      wholesalerEmail: this.authService.currentUserValue.email,
      manufacturerEmail: this.product.productBy,
      // designNumber: this.designno,
      set: this.tempCart,                           // Already has all model fields
      productId: this.product.id,
      cartAddedDate: new Date().toISOString()
    };

    try {
      const res = await this.authService.post('wholesaler-cart', payload).toPromise();
      if (res) {
        this.communicationService.customSuccess1('Product Added to Cart');
        this.tempCart = [];
        this.selectedColor = null;
      }
    } catch (error) {
      this.communicationService.customError1('Error occurred while saving...!!!');
    }
  }
}
