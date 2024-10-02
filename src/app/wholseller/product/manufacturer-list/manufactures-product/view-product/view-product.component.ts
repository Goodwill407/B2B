import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    FormsModule
  ],
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.scss']
})
export class ViewProductComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any;
  hoveredColourName: string = '';
  constructor(private location: Location, private route: ActivatedRoute, public authService: AuthService, private router: Router, private communicationService: CommunicationService) { }

  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image'; // 'image' or 'video'
  ProductId: any = '';
  selectedColourCollection: any = null;
  selectedColourName: string = '';

  ngOnInit(): void {
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
    this.authService.get('products/' + id).subscribe((res: any) => {
      if (res) {
        this.product = {
          brand: res.brand,
          designNumber: res.designNumber,
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
        };
        this.selectColourCollection(this.product.colours[0]);
        this.quantity = this.product.minimumOrderQty;
      }
    });
  }

  navigateFun() {
    this.location.back();
  }

  changeMainMedia(media: any) {
    this.selectedMedia = media.src;
    this.selectedMediaType = media.type;
  }

  editProduct() {
    this.router.navigate(['mnf/add-new-product'], { queryParams: { id: this.ProductId } });
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
    this.authService.post('wishlist', { productId: this.ProductId, email: this.userProfile.email }).subscribe((res: any) => {
      this.checkWishlist();
    }, (err: any) => {
      this.wishlist = false;
    })
  }

  checkWishlist() {
    this.authService.get('wishlist/checkout/wishlist?productId=' + this.ProductId + '&email=' + this.userProfile.email).subscribe((res: any) => {
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
