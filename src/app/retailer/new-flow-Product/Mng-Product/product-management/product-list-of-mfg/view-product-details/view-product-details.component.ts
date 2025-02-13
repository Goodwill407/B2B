import { CommonModule,Location, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';



@Component({
  selector: 'app-view-product-details',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './view-product-details.component.html',
  styleUrl: './view-product-details.component.scss'
})
export class ViewProductDetailsComponent {

  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
  constructor(private location: Location,private renderer: Renderer2, private route: ActivatedRoute, public authService: AuthService, private fb: FormBuilder, private communicationService: CommunicationService,private dialog: MatDialog) { }
 @ViewChild('mainImage') mainImage!: ElementRef; // Reference to the main image element
   zoomed: boolean = false;
  WholeselerEmail: any;
  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image'; // 'image' or 'video'
  ProductId: any = '';
  selectedColourCollection: any = null;
  selectedColourName: string = '';
  stepThree!: FormGroup;
  selectedSizes: any[] = [];
  colourCollections: any[] = [];
  designno:any;
  Prodnum:any;
  rowTotals:any;
  
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
    this.checkWishlist();
  }

  getProductDetails(id: any) {
    this.authService.get('type2-products/' + id).subscribe((res: any) => {
      console.log(res);
      if (res) {
      this.product = {
  id: res.id,  // ✅ Ensure ID is included
  productBy: res.productBy,  // ✅ Ensure Manufacturer Email is included
  brand: res.brand,
  designNumber: res.designNumber,
  clothingType: res.clothing,
  subCategory: res.subCategory,
  gender: res.gender,
  FSIN: res.FSIN,
  title: res.productTitle,
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
  sizes: res.sizes.map((size: any) => ({
    standardSize: size.standardSize,
    brandSize: size.brandSize,
    chestSize: size.chestSize,
    frontLength: size.frontLength,
    neckSize: size.neckSize,
    shoulderSize: size.shoulderSize,
    RtlPrice: size.RtlPrice,
    singleMRP: size.singleMRP,
    manufacturerPrice: size.manufacturerPrice,
  })),
  colours: res.colourCollections.map((colour: any) => ({
    name: colour.colourName,
    hex: colour.colour,
    image: colour.colourImage,
    images: colour.productImages,
    video: colour.productVideo
  })),
  setOFnetWeight: res.setOFnetWeight,
  dimensions: res.productDimension,
  dateAvailable: res.dateOfListing ? new Date(res.dateOfListing).toLocaleDateString() : 'N/A',
  availability: res.quantity > 0 ? `${res.quantity} (In Stock)` : 'Out of Stock'
};


        this.createFormControls2();
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
      }
    });
  }

  
  navigateFun() {
    this.location.back();
  }

  getControlName(colourName: string, standardSize: string): string {
    return `${this.sanitizeControlName(colourName)}_${standardSize}`;
  }

  sanitizeControlName(colourName: string): string {
    return colourName.replace(/\s+/g, '_').toLowerCase();
  }

  disableScroll(event: WheelEvent) {
    event.preventDefault();
  }

  createFormControls2() {
    // Ensure that colourCollections and selectedSizes are populated
    if (this.product?.colours.length && this.product?.sizes.length) {
      this.product?.colours.forEach((color: any) => {
        const sanitizedColorName = this.sanitizeControlName(color.name); // Ensure control name compatibility
        this.product?.sizes.forEach((size: any) => {
          const controlName = `${sanitizedColorName}_${size.standardSize}`;
          // Check if the control already exists before adding it
          if (!this.stepThree.contains(controlName)) {
            // Add control dynamically with an initial value of 0
            this.stepThree.addControl(controlName, new FormControl(null));
          }
        });
      });
    }
  }
  
  

  // This method is called to update the row total whenever the user changes the quantity.
  updateRowTotal(color: string, size: string) {
    const controlName = this.getControlName(color, size);
    const controlValue = this.stepThree.get(controlName)?.value; // Get the value of the control
    
    console.log(controlName, controlValue, size); // Debugging logs
  
    if (controlValue != null && !isNaN(controlValue)) {
      const sizePrice = this.product?.sizes.find((s: any) => s.standardSize === size)?.RtlPrice || 0;
      const rowTotal = controlValue * sizePrice;
  
      // Store or update the row total (e.g., in an array or object)
      this.rowTotals[color] = this.rowTotals[color] || {};
      this.rowTotals[color][size] = rowTotal;
    }
  }
  


// This method calculates the total for a specific color by summing the totals for all sizes.
getRowTotal(colorName: string): number {
  let total = 0;

  // Loop through all sizes
  this.product?.sizes.forEach((size: any) => {
    const controlName = this.getControlName(colorName, size.standardSize);
    const quantity = this.stepThree.get(controlName)?.value || 0; // Default to 0 if value is not available

    // Find the price for the given size
    const sizePrice = this.product?.sizes.find((s: any) => s.standardSize === size.standardSize)?.RtlPrice || 0;
    // Ensure valid data (sizePrice and quantity are valid numbers)
    if (sizePrice && !isNaN(quantity)) {
      total += quantity * sizePrice; // Calculate total for this size
    }
  });
  return total; // Return the total for this color
}


  

async saveStepThree() {
  if (!this.product || !this.product.productBy || !this.product.id) {
    this.communicationService.customError1("Product details are not yet loaded. Please try again.");
    return;
  }

  if (this.stepThree.valid) {
    const formData = this.stepThree.value;
    const result: any[] = [];

    // Loop through each color and size combination
    this.product?.colours.forEach((color: any) => {
      const sanitizedColorName = this.sanitizeControlName(color.name);

      this.product?.sizes.forEach((size: any) => {
        const quantity = formData[`${sanitizedColorName}_${size.standardSize}`];

        // Only include sizes that have quantity selected
        if (quantity && quantity > 0) {
          // Safely convert price to string, using a fallback if RtlPrice is undefined or null
          const price = size.RtlPrice !== undefined && size.RtlPrice !== null ? size.RtlPrice.toString() : "0";

          result.push({
            productBy: this.product.productBy,  // Ensure productBy (wholesaler's email) is included
            colourName: color.name,  // Colour name
            colourImage: color.image,  // Colour image
            colour: color.colour,  // Colour hex code
            quantity: quantity,  // The quantity selected by the user
            size: size.standardSize,  // The selected size (e.g., '5XS')
            price: price,  // Ensure price is a string (either from RtlPrice or fallback to "0")
            designNumber: this.product.designNumber,  // The design number
          });
        }
      });
    });

    // Check if no valid quantities were selected
    if (result.length === 0) {
      this.communicationService.customError1("Please select at least one quantity before saving.");
      return;
    }

    // Prepare the payload
    const payload = {
      set: result,  // Array of size/color combinations
      email: this.userProfile.email,  // Retailer's email
      wholesalerEmail: this.WholeselerEmail,  // Wholesaler's email
      productBy: this.product.productBy,  // Wholesaler's email (productBy)
      cartAddedDate: new Date().toISOString(),  // Timestamp for when the cart item is added
      id: this.product.id  // Product ID
    };

    console.log("Final Payload before sending:", payload);  // Debugging log

    try {
      const res = await this.authService.post('rtl-toMnf-cart', payload).toPromise();
      if (res) {
        this.communicationService.customSuccess1('Saved Successfully...!!!');
      }
    } catch (error) {
      this.communicationService.customError1('Error occurred while saving...!!!');
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
    this.authService.post('type2-wishlist', { productId: this.ProductId, email: this.userProfile.email }).subscribe(
      (res: any) => {
        this.checkWishlist();
        this.communicationService.customSuccess1('Product Added to Wishlist'); // Display the success message
      },
      (err: any) => {
        this.wishlist = false;
        this.communicationService.customError1('Error Adding Product to Wishlist'); // Handle error case
      }
    );
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
      // "WholesalerEmail": this.WholeselerEmail,
      "productBy": data.productBy,
      "productId": data.id,
      "quantity": this.quantity
    }

    this.authService.post('rtl-toMnf-cart', cartBody).subscribe((res: any) => {
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
}