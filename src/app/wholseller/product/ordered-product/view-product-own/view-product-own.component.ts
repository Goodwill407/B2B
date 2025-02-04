import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';

@Component({
  selector: 'app-view-product-own',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './view-product-own.component.html',
  styleUrl: './view-product-own.component.scss'
})
export class ViewProductOwnComponent {
  userProfile: any;
  wishlist: boolean = false;
  quantity: any = 1;
  constructor(private location: Location, private route: ActivatedRoute, public authService: AuthService, private router: Router, private communicationService: CommunicationService, private renderer: Renderer2,private dialog: MatDialog) { }

  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image'; // 'image' or 'video'
  ProductId: any = '';
  selectedColourCollection: any = null;
  selectedColourName: string = '';
  setOfWholesalerPrice: number = 0; // Initial price from the response
  isEditEnabled: boolean = false; // To toggle edit mode for input fields
  @ViewChild('mainImage') mainImage!: ElementRef; // Reference to the main image element
  zoomed: boolean = false;

  ngOnInit(): void {
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
    this.authService.get('wholesaler-products/' + id).subscribe((res: any) => {
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
          setOfWholesalerPrice: res.setOfWholesalerPrice,
          setOfManPrice: res.setOfManPrice,
          setOfMRP: res.setOfMRP,
          setOFnetWeight: res.setOFnetWeight,
          minimumOrderQty: res.minimumOrderQty,
          dateAvailable: res.dateOfListing ? new Date(res.dateOfListing).toLocaleDateString() : 'N/A',
          availability: res.quantity > 0 ? `${res.quantity} (In Stock)` : 'Out of Stock',
          id: res.id,
          productBy: res.productBy,
        };
        this.setOfWholesalerPrice = res.setOfWholesalerPrice;
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

  calculateWholesalerPrice() {
    this.setOfWholesalerPrice = this.product.sizes
      .filter((size: any) => size.wholesalerPrice) // Only sum filled prices
      .reduce((total: number, size: any) => total + Number(size.wholesalerPrice), 0);
  }

  toggleEditMode() {
    if (this.isEditEnabled) { this.updateProduct() }
    this.isEditEnabled = !this.isEditEnabled;
  }

  updateProduct() {
    this.product.setOfWholesalerPrice = this.setOfWholesalerPrice;
    this.authService.patch(`wholesaler-products`, this.product).subscribe((data: any) => {
      this.getProductDetails(this.ProductId);
      this.communicationService.customSuccess('Wholesaler Price updated successfully')
    });
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

  openImg(path:any,size:number){
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      // width: size+'px',
      data: {path:path,width:size},  // Pass the current product data
      width: '90%', // Set the desired width
      height: '90%', // Set the desired height
      maxWidth: '90vw', // Maximum width to prevent overflow
      maxHeight: '90vh' // Maximum height to prevent overflow
    });
  }
}

