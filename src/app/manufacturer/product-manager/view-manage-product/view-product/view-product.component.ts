import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core';

@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.scss']
})
export class ViewProductComponent {
  constructor(private location: Location, private route: ActivatedRoute, public authService: AuthService, private router:Router) { }

  product: any;
  selectedMedia: any;
  selectedMediaType: string = 'image'; // 'image' or 'video'
  ProductId:any=''

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.ProductId=id
      if (id) {
        this.getProductDetails(id);
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
          sizes: res.sizes.map((size: any) => `Size: ${size.brandSize}, Front Length: ${size.frontLength}`).join(' | '),
          colours: res.colourCollections.map((colour: any) => `Colour: ${colour.colourName || colour.colourImage}`).join(' | '),
          itemWeight: res.netWeight,
          dimensions: res.ProductDeimension.map((dim: any) => `L: ${dim.length}, W: ${dim.width}, H: ${dim.height}`).join(' | '),
          dateAvailable: 'N/A', // Assuming this field is not provided in the response
          availability: 'N/A', // Assuming this field is not provided in the response
          media: [
            ...res.colourCollections[0]?.productImages.map((image: string) => ({ type: 'image', src: image })),
            { type: 'video', src: res.colourCollections[0]?.productVideo }
          ].filter(media => media.src) // Filter out any undefined media sources
        };
        this.selectedMedia = this.product.media[0].src;
        this.selectedMediaType = this.product.media[0].type;
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

  editProduct(){    
    this.router.navigate(['mnf/add-new-product'], { queryParams: { id: this.ProductId } });
  }
}
