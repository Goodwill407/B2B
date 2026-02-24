import { CommonModule, Location, TitleCasePipe } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

@Component({
  selector: 'app-edit-re-product-price',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TitleCasePipe
  ],
  templateUrl: './edit-re-product-price.component.html',
  styleUrl: './edit-re-product-price.component.scss'
})
export class EditReProductPriceComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
  Example: any;
  
  constructor(
    private location: Location,
    private renderer: Renderer2, 
    private route: ActivatedRoute, 
    public authService: AuthService, 
    private fb: FormBuilder, 
    private communicationService: CommunicationService,
    private dialog: MatDialog,
    private router: Router
  ) { }
  
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
  Prodnum: any;
  
  ngOnInit(): void {
    this.stepThree = this.fb.group({});
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    console.log(this.userProfile.email, this.userProfile);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.ProductId = id;
      if (id) {
        this.getProductDetails(id);
        this.checkWishlist()
      }
    });
  }

  getProductDetails(id: any) {
    this.authService.get('type2-products/' + id).subscribe((res: any) => {
      this.designno = res.designNumber;
      console.log(res)
      if (res) {
        console.log(res);
        this.product = {
          brand: res.brand,
          designNumber: this.designno,
          clothingType: res.clothing,
          subCategory: res.subCategory,
          gender: res.gender,
          title: res.productTitle,
          FSIN: res.FSIN,
          hsnCode: res.hsnCode,
          hsnGst: res.hsnCode,
          productType: res.productType,
          description: res.productDescription,
          material: res.material,
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
          sizes: res.sizes,
          colours: res.colourCollections.map((colour: any) => ({
            name: colour.colourName,
            hex: colour.colour,
            image: colour.colourImage,
            images: colour.productImages,
            video: colour.productVideo
          })),
          setOfManPrice: res.setOfManPrice,
          setOfMRP: res.setOfMRP,
          setOFnetWeight: res.setOFnetWeight,
          minimumOrderQty: res.minimumOrderQty,
          dimensions: res.productDimension,
          dateAvailable: res.dateOfListing ? new Date(res.dateOfListing).toLocaleDateString() : 'N/A',
          availability: res.quantity > 0 ? `${res.quantity}` : 'Out of Stock',
          id: res.id,
          productBy: res.productBy,
          inventory: res.inventory,
        };
        this.colourCollections = this.product.colours;
        this.selectedSizes = this.product.sizes.map((item: any) => {
          return {
            size: item.standardSize,
            price: item.manufacturerPrice,
            MRP: item.singleMRP
          }
        });
        this.createFormControls2();
        this.getpriceDetails(id);
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
      }
    });
  }

  async getpriceDetails(id: any) {
    this.authService.get(`/wholesaler-price-type2/retailer-product/wholesaler/wise?productId=${id}&wholesalerEmail=${this.userProfile.email}`).subscribe((res: any) => {
      if (res) {
        this.designno = res.designNumber;

        this.selectedSizes.forEach((size: any) => {
          const controlName = `wholesalerPrice_${size.size}`;
          const price = res.set.find((item: any) => item.size === size.size)?.wholesalerPrice;

          this.stepThree.patchValue({
            [controlName]: price || '',
          });
        });

        console.log(res);
      } else {
        console.log('No price details found for this ID');
      }
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
    this.colourCollections.forEach((color: any) => {
      const sanitizedColorName = this.sanitizeControlName(color.name);
      this.selectedSizes.forEach((size: any) => {
        const controlName = `${sanitizedColorName}_${size.size}`;
        const wholesalerControlName = `wholesalerPrice_${size.size}`;
        const mrpControlName = `singleMRP_${size.size}`;

        this.stepThree.addControl(controlName, new FormControl(''));
        // ✅ Add Validators.required to wholesaler price
        this.stepThree.addControl(wholesalerControlName, new FormControl('', [Validators.required, Validators.min(0)]));
        this.stepThree.addControl(mrpControlName, new FormControl(size.MRP || ''));
      });
    });
  }

  updateRowTotal(colorName: string, sizeName: string) {
    // Optional logic
  }
  
  getRowTotal(colorName: string): number {
    let total = 0;
    this.selectedSizes.forEach(size => {
      const controlName = this.getControlName(colorName, size.size);
      const quantity = this.stepThree.get(controlName)?.value || 0;
      total += quantity * size.price;
    });
    return total;
  }
  
  async saveStepThree() {
    // ✅ Mark all fields as touched to show validation errors
    Object.keys(this.stepThree.controls).forEach(key => {
      this.stepThree.get(key)?.markAsTouched();
    });

    // ✅ Check if all wholesaler prices are filled
    if (this.stepThree.invalid) {
      this.communicationService.customError('Please fill all Wholesaler Price fields before proceeding.');
      return;
    }

    const formData = this.stepThree.value;
    const setArray: any[] = [];

    this.selectedSizes.forEach((size: any) => {
      const wholesalerControlName = `wholesalerPrice_${size.size}`;
      const mrpControlName = `singleMRP_${size.size}`;
      const wholesalerPrice = formData[wholesalerControlName];
      const singleMRP = formData[mrpControlName];
      const manufacturerPrice = size.price;

      if (wholesalerPrice && manufacturerPrice && singleMRP) {
        setArray.push({
          _id: size._id,
          size: size.size,
          wholesalerPrice: wholesalerPrice,
          singleMRP: singleMRP,
          manufacturerPrice: manufacturerPrice,
        });
      }
    });

    const payload = {
      productId: this.ProductId,
      WholesalerEmail: this.authService.currentUserValue.email,
      manufacturerEmail: this.product.productBy,
      brandName: this.product.brand,
      set: setArray,
    };

    try {
      const res = await this.authService.post('wholesaler-price-type2', payload).toPromise();

      if (res) {
        this.communicationService.customSuccess1('Price Added Successfully...!!!');
        
        // ✅ Navigate to Add Wholesaler Inventory after successful price addition
        setTimeout(() => {
          this.router.navigate(['/wholesaler/wh-add-stock-of-product'], {
            queryParams: { 
              id: this.ProductId,
              email: this.userProfile.email,
              CompanyName: this.userProfile.CompanyName || this.userProfile.companyName || ''
            }
          });
        }, 1500);
      }
    } catch (error) {
      this.communicationService.customError1('Error occurred while Adding Price...!!!');
    }
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
    this.authService.post('type2-wishlist', { productId: this.ProductId, email: this.userProfile.email }).subscribe((res: any) => {
      this.checkWishlist();
    }, (err: any) => {
      this.wishlist = false;
    })
  }

  checkWishlist() {
    this.authService.get('type2-wishlist/checkout/wishlist?productId=' + this.ProductId + '&email=' + this.userProfile.email).subscribe((res: any) => {
      if (res) {
        this.wishlist = true;
      } else {
        this.wishlist = false;
      }
    })
  }

  addToCart(data: any) {
    const quantity = Number(this.quantity);
    const availability = Number(data.availability);
    const minimumOrderQty = Number(data.minimumOrderQty);

    if (quantity > availability) {
      this.communicationService.customError1('Quantity should not exceed available stock');
      return;
    } else if (quantity < minimumOrderQty) {
      this.communicationService.customError1(`Quantity should be at least Minimum Order Quantity(${minimumOrderQty}).`);
      return;
    }
    const cartBody = {
      "email": this.userProfile.email,
      "productBy": data.productBy,
      "productId": data.id,
      "quantity": this.quantity
    }

    this.authService.post('cart', cartBody).subscribe((res: any) => {
      this.communicationService.customSuccess('Product Successfully Added in Cart');
    },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    )
  }

  zoomImage(event: MouseEvent) {
    const imageElement = this.mainImage?.nativeElement;

    if (!imageElement) {
      console.error('Image element not found.');
      return;
    }
    this.renderer.setStyle(imageElement, 'transform', `scale(1.8)`);
    this.renderer.setStyle(imageElement, 'cursor', 'zoom-in');
    this.renderer.setStyle(imageElement, 'transform-origin', `${event.offsetX}px ${event.offsetY}px`);
  }

  resetZoom(event: MouseEvent) {
    const imageElement = this.mainImage?.nativeElement;

    if (!imageElement) {
      console.error('Image element not found.');
      return;
    }

    this.renderer.setStyle(imageElement, 'transform', 'none');
    this.renderer.setStyle(imageElement, 'cursor', 'default');
  }

  openImg(path: any, size: number) {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
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
}
