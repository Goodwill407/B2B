import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

@Component({
  selector: 'app-view-wholeseler-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './view-wholeseler-product.component.html',
  styleUrl: './view-wholeseler-product.component.scss',
})
export class ViewWholeselerProductComponent {
  @ViewChild('mainImage') mainImage!: ElementRef;

  product: any;
  colours: any[] = [];
  selectedMedia: string = '';
  selectedMediaType: string = 'image';

  wishlist = false;
  wishlisted = false;
  userProfile: any;
  WholeselerEmail: string = '';
  ProductId: string = '';
  productUser: string = 'wholesaler';

  selectedColor: string = '';
  selectedSize: string = '';
  selectedQuantity: number = 1;
  calculatedPrice: number = 0;
  manufacturerPrice: number = 0;

  availableSizes: string[] = [];
  retailerPrice: any;

  selectedColourName: string = '';
  hoveredColourName: string = '';
  designno: string = '';

  tempCart: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private renderer: Renderer2,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.route.params.subscribe((params) => {
      this.ProductId = params['id'];
      this.WholeselerEmail = params['WholeselerEmail'];
      this.wishlisted = params['wishlisted'];
      if (this.ProductId) this.getProductDetails(this.ProductId);
      this.checkWishlist();
    });
  }

  getProductDetails(id: any) {
  this.authService
    .get(`wholesaler-price-type2/retailer-product/wholesaler-wise?productId=${id}&wholesalerEmail=${this.WholeselerEmail}`)
    .subscribe((res: any) => {
      const productData = res.product;
      const retailerPriceData = res.retailerPrice;
      this.retailerPrice = retailerPriceData;
      this.designno = productData.designNumber;

      this.product = {
        brand: productData.brand,
        designNumber: productData.designNumber,
        clothingType: productData.clothing,
        productType: productData.productType,
        subCategory: productData.subCategory,
        gender: productData.gender,
        title: productData.productTitle,
        FSIN: productData.FSIN,
        description: productData.productDescription,
        material: productData.material || 'N/A',
        materialVariety: productData.materialvariety || 'N/A',
        pattern: productData.fabricPattern || 'N/A',
        fitType: productData.fitType || 'N/A',
        occasion: productData.selectedOccasion.filter(Boolean).join(', ') || 'N/A',
        lifestyle: productData.selectedlifeStyle.filter(Boolean).join(', ') || 'N/A',
        closureType: productData.closureType || 'N/A',
        pocketDescription: productData.noOfPockets || 'N/A',
        sleeveCuffStyle: productData.sleeveLength || 'N/A',
        neckCollarStyle: productData.neckStyle || 'N/A',
        specialFeatures: productData.specialFeature.filter(Boolean).join(', ') || 'N/A',
        careInstructions: productData.careInstructions || 'N/A',
        sizes: productData.sizes.map((size: any) => {
          const match = retailerPriceData.set.find((s: any) => s.size === size.standardSize);
          return {
            size: size.standardSize,
            price: match?.wholesalerPrice ?? size.manufacturerPrice,
            rtlPrice: size.RtlPrice,
            mrp: size.singleMRP,
            manufacturerPrice: size.manufacturerPrice,
          };
        }),
        colours: productData.colourCollections.map((colour: any) => ({
          name: colour.colourName,
          hex: colour.colour,
          image: colour.colourImage,
          images: colour.productImages,
          video: colour.productVideo,
        })),
        id: productData._id,
        productBy: productData.productBy,
        inventory: productData.inventory,
        media: [], // this will be populated below
      };

      this.colours = this.product.colours;

      // Set default selected color collection
      if (this.product.colours.length > 0) {
        this.selectColourCollection(this.product.colours[0]);
      }
    });
}


  checkWishlist() {
    this.authService
      .get(`type2-wishlist/checkout/wishlist?productId=${this.ProductId}&email=${this.userProfile.email}&productOwnerEmail=${this.WholeselerEmail}`)
      .subscribe((res: any) => (this.wishlist = !!res));
  }

  WishlistAdd() {
    this.authService
      .post('type2-wishlist', {
        productId: this.ProductId,
        email: this.userProfile.email,
        productOwnerEmail: this.WholeselerEmail,
        productUser: this.productUser,
      })
      .subscribe(
        () => {
          this.checkWishlist();
          this.communicationService.customSuccess1('Product Added to Wishlist');
        },
        () => {
          this.communicationService.customError1('Error Adding Product to Wishlist');
        }
      );
  }

  onColorChange() {
    this.availableSizes = this.retailerPrice.set.map((s: any) => s.size);
    this.selectedSize = '';
    this.calculatedPrice = 0;
  }

  getPriceBySize(size: string): number {
    const match = this.retailerPrice.set.find((s: any) => s.size === size);
    return match ? +match.wholesalerPrice : 0;
  }

  getManufacturerPrice(size: string): number {
    const m = this.product?.sizes.find((s: any) => s.size === size);
    return m ? +m.manufacturerPrice : 0;
  }

  onSizeChange() {
    this.calculatedPrice = this.getPriceBySize(this.selectedSize);
    this.manufacturerPrice = this.getManufacturerPrice(this.selectedSize);
  }

  addItem() {
    if (!this.selectedColor || !this.selectedSize || !this.selectedQuantity) {
      alert('Please select color, size and quantity.');
      return;
    }

    const matchColor = this.colours.find((c) => c.name === this.selectedColor);
    const existing = this.tempCart.find(
      (i) => i.colourName === this.selectedColor && i.size === this.selectedSize
    );

    if (existing) {
      existing.quantity += this.selectedQuantity;
    } else {
      this.tempCart.push({
        colourName: this.selectedColor,
        size: this.selectedSize,
        quantity: this.selectedQuantity,
        price: this.calculatedPrice.toString(),
        manufacturerPrice: this.manufacturerPrice,
        designNumber: this.designno,
        colour: matchColor?.hex || '',
        colourImage: matchColor?.image || '',
      });
    }

    this.selectedSize = '';
    this.selectedQuantity = 1;
    this.calculatedPrice = 0;
  }

  removeItem(i: number) {
    this.tempCart.splice(i, 1);
  }

  async addToCartArray() {
    const payload = {
      set: this.tempCart.map((item) => ({
        ...item,
        productType: this.product.productType,
        gender: this.product.gender,
        clothing: this.product.clothingType,
        subCategory: this.product.subCategory,
        brandName:this.product.brand
      })),
      productId: this.product._id,
      email: this.userProfile.email,
      wholesalerEmail: this.WholeselerEmail,
      productBy: this.product.productBy,
    };

    try {
      const res = await this.authService.post('retailer-cart-type2', payload).toPromise();
      if (res) {
        this.communicationService.customSuccess1('Product Added to Cart');
        this.tempCart = [];
      }
    } catch {
      this.communicationService.customError1('Error occurred while saving...!!!');
    }
  }

  // Image handling
  selectColourCollection(colour: any) {
    this.selectedColourName = colour.name;
    const media = [
      ...colour.images.map((img: string) => ({ type: 'image', src: img })),
      { type: 'video', src: colour.video },
    ].filter((m) => m.src);

    this.product.media = media;
    this.selectedMedia = media[0]?.src;
    this.selectedMediaType = media[0]?.type;
  }

  changeMainMedia(media: any) {
    this.selectedMedia = media.src;
    this.selectedMediaType = media.type;
  }

  zoomImage(e: MouseEvent) {
    const el = this.mainImage?.nativeElement;
    if (el) {
      this.renderer.setStyle(el, 'transform', `scale(1.8)`);
      this.renderer.setStyle(el, 'cursor', 'zoom-in');
      this.renderer.setStyle(el, 'transform-origin', `${e.offsetX}px ${e.offsetY}px`);
    }
  }

  resetZoom(_: MouseEvent) {
    const el = this.mainImage?.nativeElement;
    if (el) {
      this.renderer.setStyle(el, 'transform', 'none');
      this.renderer.setStyle(el, 'cursor', 'default');
    }
  }

  openImg(path: string, size: number) {
    this.dialog.open(ImageDialogComponent, {
      data: { path: path, width: size },
      width: '90%',
      height: '90%',
      maxWidth: '90vw',
      maxHeight: '90vh',
    });
  }

  onHoverColour(colour: any) {
    this.hoveredColourName = this.selectedColourName;
    this.selectedColourName = colour.name;
  }

  onLeaveColour() {
    this.selectedColourName = this.hoveredColourName;
  }

  navigateFun() {
    history.back();
  }
}
