import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Location } from '@angular/common';

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
  constructor(private location: Location){}

  product: any = {
    brand: 'Brand Name',
    designNumber: 'DN0010A',
    clothingType: 'T-Shirt',
    subCategory: 'T-Shirt',
    gender: 'Men',
    title: 'Product Title',
    description: 'Product Description',
    material: 'Cotton',
    materialVariety: '100%',
    pattern: 'Solid',
    fitType: 'Regular',
    occasion: 'Occasion',
    lifestyle: 'Lifestyle',
    closureType: 'Closure Type',
    pocketDescription: 'Pocket Description',
    sleeveCuffStyle: 'Sleeve Cuff Style',
    neckCollarStyle: 'Neck / Collar Style',
    specialFeatures: 'Special Features',
    careInstructions: 'Care Instructions',
    sizes: 'XS, S, M, L, XL, XXL',
    colours: 'Colours / Designs',
    itemWeight: 'Item Weight',
    dimensions: 'L x W x H',
    dateAvailable: 'Date First Available',
    availability: 'In Stock',
    images: [
      'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
      'https://m.media-amazon.com/images/I/71T6D0EFLxL._SX569_.jpg',
      'https://m.media-amazon.com/images/I/51jobfV6gwL._SY741_.jpg',
      'https://m.media-amazon.com/images/I/91QQX4CQU2L._SX569_.jpg'
    ]
  };

  selectedImage: string = this.product.images[0];

  ngOnInit(): void {}

  navigateFun() {
    this.location.back();
  }

  changeMainImage(image: string) {
    this.selectedImage = image;
  }
}
