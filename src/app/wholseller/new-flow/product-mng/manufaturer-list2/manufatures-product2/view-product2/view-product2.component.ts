import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

@Component({
  selector: 'app-view-product2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
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

  constructor(private location: Location, private renderer: Renderer2, private route: ActivatedRoute, public authService: AuthService, private fb: FormBuilder, private communicationService: CommunicationService, private dialog: MatDialog) { }
  @ViewChild('mainImage') mainImage!: ElementRef; // Reference to the main image element
  zoomed: boolean = false;

  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image'; // 'image' or 'video'
  ProductId: any = '';
  selectedColourCollection: any = null;
  selectedColourName: string = '';
  stepThree!: FormGroup;
  selectedSizes: any[] = [];
  colourCollections: any[] = [];
  designno: any;
  Prodnum: any;
productType:any;

  electedColor: any = null;
  selectedSize: string = '';
  selectedQuantity: number = 1;
  calculatedPrice: number = 0;
  colours: any;
  mnfPrice: any;

  tempCart: Array<{
    colourName: string;
    size: string;
    quantity: number;
    price: any;
    designNumber: any;
    colour: any,
    colourImage: any
  }> = [];

  ngOnInit(): void {
    this.stepThree = this.fb.group({});
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.ProductId = id;
      if (id) {
        this.getProductDetails(id);
        // this.checkWishlist()
      }
    });
  }

  getProductDetails(id: any) {
    this.authService.get('type2-products/' + id).subscribe((res: any) => {
      this.designno = res.designNumber;
      this.productType = res.productType;
      this.gender=res.gender;
      this.clothingType=res.clothing;
      if (res) {
        this.product = {
          brand: res.brand,
          designNumber: this.designno,

          clothingType: res.clothing,
          subCategory: res.subCategory,
          gender: res.gender,
          title: res.productTitle,
          description: res.productDescription,
          material: res.material,
          FSIN: res.FSIN,
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
            price: item.manufacturerPrice
          }
        });

        this.colours = this.colourCollections;

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
    this.colourCollections.forEach((color: any) => {
      const sanitizedColorName = this.sanitizeControlName(color.name); // Ensure control name compatibility
      this.selectedSizes.forEach((size: any) => {
        const controlName = `${sanitizedColorName}_${size.size}`;
        this.stepThree.addControl(controlName, new FormControl(''));
      });
    });
  }

  updateRowTotal(colorName: string, sizeName: string) {
    // Optional: You can add logic here to do something when the input changes
  }

  getRowTotal(colorName: string): number {
    let total = 0;

    this.selectedSizes.forEach(size => {
      const controlName = this.getControlName(colorName, size.size);
      const quantity = this.stepThree.get(controlName)?.value || 0; // Get the quantity for the control
      total += quantity * size.price; // Calculate total for this size
    });

    return total; // Return the total for this color
  }

  async saveStepThree() {
    if (this.stepThree.valid) {
      const formData = this.stepThree.value;
      const result: any[] = [];

      this.colourCollections.forEach((color: any) => {
        const sanitizedColorName = this.sanitizeControlName(color.name);
        this.selectedSizes.forEach((size: any) => {
          const quantity = formData[`${sanitizedColorName}_${size.size}`];
          if (quantity) {
        result.push({
  colourName: color.name,
  colourImage: color.image,
  colour: color.hex,
  quantity,
  ...size,
  designNumber: this.designno,
  productType: this.productType , // ✅ here
  gender: this.gender,            // ✅ Added
  clothing: this.clothingType 
});

          }
        });
      });

      const payload = {
        set: result,
        productId: this.product.id,
        email: this.authService.currentUserValue.email,
        productBy: this.product.productBy

      };

      try {
        const res = await this.authService.post('type2-cart', payload).toPromise();
        if (res) {
          this.communicationService.customSuccess1('Saved Successfully...!!!');
        }
      } catch (error) {
        this.communicationService.customError1('Error occurred while saving...!!!');
      } finally {
        // Cleanup if needed
      }
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
    ].filter(media => media.src); // Filter out any undefined media sources
    this.product.media = media;
    this.selectedMedia = media[0]?.src;
    this.selectedMediaType = media[0]?.type;
  }

  WishlistAdd() {
    this.authService.post('type2-wishlist', { productId: this.ProductId, email: this.userProfile.email }).subscribe((res: any) => {
      this.communicationService.customSuccess1('Product Added to Wishlist'); // Display the success message
      this.checkWishlist();
    }, (err: any) => {
      this.wishlist = false;
      this.communicationService.customError1('Error Adding Product to Wishlist'); // Handle error case
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
    const quantity = Number(this.quantity); // Convert to number
    const availability = Number(data.availability); // Convert to number
    const minimumOrderQty = Number(data.minimumOrderQty); // Convert to number

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
    const imageElement = this.mainImage?.nativeElement; // Get the native image element

    if (!imageElement) {
      console.error('Image element not found.');
      return;
    }
    this.renderer.setStyle(imageElement, 'transform', `scale(1.8)`);
    this.renderer.setStyle(imageElement, 'cursor', 'zoom-in');
    this.renderer.setStyle(imageElement, 'transform-origin', `${event.offsetX}px ${event.offsetY}px`);
  }

  resetZoom(event: MouseEvent) {
    const imageElement = this.mainImage?.nativeElement; // Get the native image element

    if (!imageElement) {
      console.error('Image element not found.');
      return;
    }

    this.renderer.setStyle(imageElement, 'transform', 'none');
    this.renderer.setStyle(imageElement, 'cursor', 'default');
  }

  openImg(path: any, size: number) {
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      // width: size+'px',
      data: { path: path, width: size },  // Pass the current product data
      width: '90%', // Set the desired width
      height: '90%', // Set the desired height
      maxWidth: '90vw', // Maximum width to prevent overflow
      maxHeight: '90vh' // Maximum height to prevent overflow
    });
  }
  onHoverColour(colour: any) {
    this.hoveredColourName = this.selectedColourName; // Save the current selected name to revert later
    this.selectedColourName = colour.name; // Set the name to the hovered color name
  }

  onLeaveColour() {
    this.selectedColourName = this.hoveredColourName; // Revert to the original selected name when hover is removed
  }


  // colours = this.product?.colourCollections || [];
  availableSizes: string[] = [];

  // 1) Rebuild sizes whenever you pick a color
  onColorChange() {
    if (!this.selectedColor) {
      this.availableSizes = [];
      this.selectedSize = '';
      this.calculatedPrice = 0;
      return;
    }

    // Grab every standardSize string
    this.availableSizes = this.product.sizes.map((s: any) => s.standardSize);
    this.selectedSize = '';
    this.calculatedPrice = 0;
  }

  getPriceBySize(size: string): number {
    // Find the size record
    const sizeObj = (this.product.sizes || [])
      .find((s: any) => s.standardSize === size);

    // Parse the manufacturerPrice (string) into a number
    return sizeObj
      ? Number(sizeObj.manufacturerPrice)
      : 0;
  }

  onSizeChange() {
    if (this.selectedSize) {
      this.calculatedPrice = this.getPriceBySize(this.selectedSize);
    }
  }

  addItem() {
    if (!this.selectedColor || !this.selectedSize || !this.selectedQuantity) {
      alert('Please select color, size and quantity.');
      return;
    }

    const price = this.getPriceBySize(this.selectedSize);

    // Find the matching color object from this.colours
    const matchedColor = this.colours.find((c: { name: string; }) => c.name.toLowerCase() === this.selectedColor.toLowerCase());

    const colourHex = matchedColor?.hex || '';
    const colourImage = matchedColor?.image || '';

    // Check if this combination already exists
    const existingItem = this.tempCart.find(item =>
      item.colourName === this.selectedColor && item.size === this.selectedSize
    );

    if (existingItem) {
      // Update quantity and price
      existingItem.quantity += this.selectedQuantity;
      existingItem.price = price.toString(); // Optional: If price might change
    } else {
      // Add as new item
      this.tempCart.push({
        colourName: this.selectedColor,
        size: this.selectedSize,
        quantity: this.selectedQuantity,
        price: this.calculatedPrice.toString(),
        designNumber: this.designno,
        colour: colourHex,
        colourImage: colourImage
      });
    }

    // Reset after adding
    this.selectedSize = '';
    this.selectedQuantity = 1;
    this.calculatedPrice = 0;
  }


  removeItem(index: number) {
    this.tempCart.splice(index, 1);
  }


  async addToCartArray() {
    const payload = {
  set: this.tempCart.map(item => ({
    ...item,
    productType: this.productType ,// ✅ added dynamically
    gender: this.product.gender,            // ✅ Added
    clothing: this.product.clothingType 
  })),
  productId: this.product.id,
  email: this.authService.currentUserValue.email,
  productBy: this.product.productBy
};


    try {
      const res = await this.authService.post('type2-cart', payload).toPromise();
      if (res) {
        this.communicationService.customSuccess1('Product Added to Cart');
        this.tempCart = [];
      }
    } catch (error) {
      this.communicationService.customError1('Error occurred while saving...!!!');
    } finally {
      // Cleanup if needed
    }
  }

}