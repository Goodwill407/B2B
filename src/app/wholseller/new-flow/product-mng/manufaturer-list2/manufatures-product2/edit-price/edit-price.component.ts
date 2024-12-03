import { CommonModule,Location } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
@Component({
  selector: 'app-edit-price',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-price.component.html',
  styleUrl: './edit-price.component.scss'
})
export class EditPriceComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
  Example: any;
  constructor(private location: Location, private route: ActivatedRoute, public authService: AuthService, private fb: FormBuilder, private communicationService: CommunicationService) { }

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
  
  ngOnInit(): void {
    this.stepThree = this.fb.group({});
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
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
        this.product = {
          brand: res.brand,
          designNumber: this.designno,
        
          clothingType: res.clothing,
          subCategory: res.subCategory,
          gender: res.gender,
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
          size:item.standardSize,
          price:item.manufacturerPrice}
        });
        this.createFormControls2();
        this.getpriceDetails(id);
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
      }
    });
  }
  async getpriceDetails(id: any) {
    this.authService.get('wholesaler-price-type2/' + id).subscribe((res: any) => {
      if (res) {
        this.designno = res.designNumber; // Store the design number
  
        // Map the retrieved data to form controls
        this.selectedSizes.forEach((size: any) => {
          const controlName = `wholesalerPrice_${size.size}`; // Form control for each size
          const price = res.set.find((item: any) => item.size === size.size)?.wholesalerPrice;
  
          // If price is found, set it, otherwise leave it blank
          this.stepThree.patchValue({
            [controlName]: price || '', // Use blank if no price found
          });
        });
  
        console.log(res); // Check the response for debugging
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
    
        // Add controls for quantity and wholesaler price
        this.stepThree.addControl(controlName, new FormControl(''));
        this.stepThree.addControl(wholesalerControlName, new FormControl(''));
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
      const setArray: any[] = [];
  
      // Loop through sizes and collect price data
      this.selectedSizes.forEach((size: any) => {
        const controlName = `wholesalerPrice_${size.size}`;
        const price = formData[controlName]; // Get the value entered for each size
  
        // If a price is provided, add it to the set array
        if (price) {
          setArray.push({
            designNumber: this.designno,
            size: size.size,
            wholesalerPrice: price,
          });
        }
      });
  
      // Construct the payload
      const payload = {
        productId: this.ProductId, // Sent once
        WholesalerEmail: this.authService.currentUserValue.email, // Replace with dynamic email if necessary
        manufacturerEmail: this.product.productBy, // Sent once
        brandName: this.product.brand, // Sent once
        set: setArray, // Repeated entries for sizes and prices
      };
  
      try {
        // Send API request
        const res = await this.authService.post('wholesaler-price-type2', payload).toPromise();
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

  onHoverColour(colour: any) {
    this.hoveredColourName = this.selectedColourName; // Save the current selected name to revert later
    this.selectedColourName = colour.name; // Set the name to the hovered color name
  }

  onLeaveColour() {
    this.selectedColourName = this.hoveredColourName; // Revert to the original selected name when hover is removed
  }
}