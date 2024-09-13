import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-view-wholeseler-product',
  standalone: true,
  imports: [
    CommonModule,
    NgIf, NgFor,
    FormsModule
  ],
  templateUrl: './view-wholeseler-product.component.html',
  styleUrl: './view-wholeseler-product.component.scss'
})
export class ViewWholeselerProductComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any = 1;
  constructor(private location: Location, private route: ActivatedRoute, public authService: AuthService, private router: Router, private communicationService:CommunicationService) { }

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
    this.authService.get(`wholesaler-products/${id}`).subscribe((res: any) => {
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
          dateAvailable: res.dateOfListing ? new Date(res.dateOfListing).toLocaleDateString() : 'N/A',
          availability: res.quantity > 0 ? `${res.quantity} (In Stock)` : 'Out of Stock',
          id: res.id,
          productBy: res.productBy,
        };
        this.selectColourCollection(this.product.colours[0]);
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
    },(err:any)=>{
      this.wishlist = false;
    })
  }

  checkWishlist() {
    this.authService.get('wishlist/checkout/wishlist?productId='+ this.ProductId +'&email='+this.userProfile.email).subscribe((res: any) => {
      if (res) {
        this.wishlist = true;
      } else {
        this.wishlist = false;
      }
    })
  }

  addToCart(data: any) {
    const cartBody = {
    "email": this.userProfile.email,
    "productBy": data.productBy,
    "productId": data.id,
    "quantity": this.quantity
    }

    this.authService.post('cart', cartBody).subscribe((res: any) => {
      this.communicationService.showNotification('snackbar-success','Product Successfully Added in Cart','bottom','center');
    },
    (error) => {
      this.communicationService.showNotification('snackbar-error', error.error.message, 'bottom', 'center');
    }
  )
  }
}
