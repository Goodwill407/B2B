import { CommonModule,Location, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-view-wholeseler-product',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './view-wholeseler-product.component.html',
  styleUrl: './view-wholeseler-product.component.scss'
})
export class ViewWholeselerProductComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
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
        // this.checkWishlist()
      }
    });
  }

  getProductDetails(id: any) {
    this.authService.get('wholesaler-price-type2/retailer-product/' + id).subscribe((res: any) => {
      this.designno = res.product.designNumber;
  
      if (res) {
        const productData = res.product;
        const retailerPriceData = res.retailerPrice;
  
        // Start building the product object
        this.product = {
          brand: productData.brand,
          designNumber: this.designno,
          clothingType: productData.clothing,
          subCategory: productData.subCategory,
          gender: productData.gender,
          title: productData.productTitle,
          description: productData.productDescription,
          material: productData.material,
          materialVariety: productData.materialvariety,
          pattern: productData.fabricPattern,
          fitType: productData.fitStyle,
          occasion: productData.selectedOccasion.join(', '), // or 'N/A' if empty
          lifestyle: productData.selectedlifeStyle.join(', '), // or 'N/A' if empty
          closureType: productData.closureType,
          pocketDescription: productData.noOfPockets,
          sleeveCuffStyle: productData.sleeveLength,
          neckCollarStyle: productData.neckStyle,
          specialFeatures: productData.specialFeature.join(', '),
          careInstructions: productData.careInstructions,
          sizes: productData.sizes.map((size: any) => ({
            size: size.standardSize,
            price: size.manufacturerPrice, // Initially set manufacturerPrice
            rtlPrice: size.RtlPrice,
            mrp: size.singleMRP
          })),
          colours: productData.colourCollections.map((colour: any) => ({
            name: colour.colourName,
            hex: colour.colour,
            image: colour.colourImage,
            images: colour.productImages,
            video: colour.productVideo
          })),
          setOfManPrice: [], // This will be populated by matching sizes
          setOfMRP: [], // You can add logic for MRP if available in the response
          setOFnetWeight: [], // You can add logic for net weight if needed
          minimumOrderQty: productData.sizes.length ? productData.sizes[0].weight : 1, // Use a valid logic
          dimensions: productData.productDimension || 'N/A',
          dateAvailable: productData.dateOfListing ? new Date(productData.dateOfListing).toLocaleDateString() : 'N/A',
          availability: productData.inventory.map((inv: any) => ({
            colour: inv.colourName,
            size: inv.size,
            quantity: inv.quantity || 0
          })),
          id: productData._id,
          productBy: productData.productBy,
          inventory: productData.inventory,
        };
  
        // Replace manufacturerPrice with wholesalerPrice by matching sizes
        productData.sizes.forEach((size: any) => {
           retailerPriceData.set.find((setItem: any) => { 
            
            if(setItem.size === size.standardSize)size.manufacturerPrice = setItem.wholesalerPrice;


          });
        });
  
        // Update the product object after replacing prices
        this.product.sizes = productData.sizes.map((size: any) => ({
          size: size.standardSize,
          price: size.manufacturerPrice, // Updated manufacturerPrice with wholesalerPrice
          rtlPrice: size.RtlPrice,
          mrp: size.singleMRP
        }));
  
        // Optional: Populate available colour and size information
        this.colourCollections = this.product.colours;
        this.selectedSizes = this.product.sizes.map((item: any) => {
          return {
            size: item.size,
            price: item.price, // Use wholesalerPrice if available
            wholesalerPrice: item.manufacturerPrice // Add wholesalerPrice here
          };
        });
  
        // Additional methods or logic (e.g., form controls, colour selection, etc.)
        this.createFormControls2();
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
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
              designNumber: this.designno, // Use the class-level design number here
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