import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-view-manage-product',
  standalone: true,
  imports: [
    NgFor, NgIf,
    FormsModule,
    NgStyle,
    RouterModule
  ],
  templateUrl: './view-manage-product.component.html',
  styleUrl: './view-manage-product.component.scss'
})
export class ViewManageProductComponent {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    clothing: '',
    subCategory: ''
  };

  products = [
    {
      designNo: '12345',
      imageUrl: 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
      selectedImageUrl: 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
      title: 'Amazon Brand - Symbol Men\'s Solid Cotton Formal Shirt',
      description: 'Plain | Full Sleeve | Regular Fit',
      selectedColor: '#000000',
      colors: ['#000000', '#FFFFFF', '#808080'],
      images: {
        '#000000': 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
        '#FFFFFF': 'https://m.media-amazon.com/images/I/71T6D0EFLxL._SX569_.jpg',
        '#808080': 'https://m.media-amazon.com/images/I/51jobfV6gwL._SY741_.jpg'
      },
      stock: 2000
    },
    {
      designNo: '12346',
      imageUrl: 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg',
      selectedImageUrl: 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg',
      title: 'Amazon Brand - Symbol Men\'s Solid Cotton Formal Shirt',
      description: 'Plain | Full Sleeve | Regular Fit',
      selectedColor: '#000000',
      colors: ['#000000', '#FFFFFF', '#808080'],
      images: {
        '#000000': 'https://m.media-amazon.com/images/I/91QQX4CQU2L._SX569_.jpg',
        '#FFFFFF': 'https://m.media-amazon.com/images/I/71C3mSY5DOL._SX569_.jpg',
        '#808080': 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg'
      },
      stock: 0
    },
    // Add more product objects as needed
  ];

  constructor() { }

  ngOnInit(): void {
  }

  applyFilters(): void {
    // Apply filter logic here
    console.log('Filters applied:', this.filters);
  }

  changeProductImage(product: any, color: string): void {
    product.selectedImageUrl = product.images[color];
    product.selectedColor = color;
  }
}
