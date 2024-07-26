import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core';

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
export class ViewManageProductComponent implements OnInit {
  filters = {
    brand: '',
    productType: '',
    gender: '',
    clothing: '',
    subCategory: ''
  };

  products: any[] = [];
  allBrand: any;
  allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
  allGender = ['Men', 'Women', 'Boys', 'Girl', 'Unisex'];
  allClothing: any;
  allSubCategory: any;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    this.getAllBrands();
    this.getClothingType();
    this.getSubCategory();
    this.getAllProducts();
  }

  applyFilters(): void {
    // Apply filter logic here
    console.log('Filters applied:', this.filters);
  }

  changeProductImage(product: any, color: string): void {
    const selectedColor = product.colourCollections.find((c: any) => c.colour === color);
    if (selectedColor) {
      product.selectedImageUrl = selectedColor.productImages[0];
      product.selectedColor = color;
    }
  }

  getAllBrands() {
    this.authService.get(`brand?page=1`).subscribe((res: any) => {
      this.allBrand = res.results;
    });
  }

  getClothingType() {
    this.authService.get('clothing-mens').subscribe(res => {
      if (res) {
        this.allClothing = res.results;
      }
    }, (error) => {
      console.log(error);
    });
  }

  getSubCategory() {
    const f = this.filters;
    this.authService.get(`sub-category?productType=${f.productType}&clothing=${f.clothing}&gender${f.gender}`).subscribe(res => {
      if (res) {
        this.allSubCategory = res.results;
      }
    }, (error) => {
      console.log(error);
    });
  }

  getAllProducts() {
    this.authService.get('products').subscribe((res: any) => {
      if (res) {
        this.products = res.results.map((product: any) => ({
          designNo: product.designNumber,
          selectedImageUrl: product.colourCollections[0]?.productImages[0] || '',
          title: product.productTitle,
          description: product.productDescription,
          selectedColor: product.colourCollections[0]?.colour || '',
          colors: product.colourCollections.map((c: any) => c.colour),
          colourCollections: product.colourCollections,
          stock: 2000 // Replace with actual stock value if available
        }));
      }
    });
  }
}

// import { NgFor, NgIf, NgStyle } from '@angular/common';
// import { Component } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { AuthService } from '@core';

// @Component({
//   selector: 'app-view-manage-product',
//   standalone: true,
//   imports: [
//     NgFor, NgIf,
//     FormsModule,
//     NgStyle,
//     RouterModule
//   ],
//   templateUrl: './view-manage-product.component.html',
//   styleUrl: './view-manage-product.component.scss'
// })
// export class ViewManageProductComponent {
//   filters = {
//     brand: '',
//     productType: '',
//     gender: '',
//     clothing: '',
//     subCategory: ''
//   };

//   products = [
//     {
//       designNo: '12345',
//       imageUrl: 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
//       selectedImageUrl: 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
//       title: 'Amazon Brand - Symbol Men\'s Solid Cotton Formal Shirt',
//       description: 'Plain | Full Sleeve | Regular Fit',
//       selectedColor: '#000000',
//       colors: ['#000000', '#FFFFFF', '#808080'],
//       images: {
//         '#000000': 'https://m.media-amazon.com/images/I/71ac4lX5hOL._SX569_.jpg',
//         '#FFFFFF': 'https://m.media-amazon.com/images/I/71T6D0EFLxL._SX569_.jpg',
//         '#808080': 'https://m.media-amazon.com/images/I/51jobfV6gwL._SY741_.jpg'
//       },
//       stock: 2000
//     },
//     {
//       designNo: '12346',
//       imageUrl: 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg',
//       selectedImageUrl: 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg',
//       title: 'Amazon Brand - Symbol Men\'s Solid Cotton Formal Shirt',
//       description: 'Plain | Full Sleeve | Regular Fit',
//       selectedColor: '#000000',
//       colors: ['#000000', '#FFFFFF', '#808080'],
//       images: {
//         '#000000': 'https://m.media-amazon.com/images/I/91QQX4CQU2L._SX569_.jpg',
//         '#FFFFFF': 'https://m.media-amazon.com/images/I/71C3mSY5DOL._SX569_.jpg',
//         '#808080': 'https://m.media-amazon.com/images/I/61NloRw77IL._SY879_.jpg'
//       },
//       stock: 0
//     },
//     // Add more product objects as needed
//   ];
//   allBrand: any;
//   allProductType = ["Clothing", "Bags", "Jewellery", "Shoes", "accessories", "Footwear"];
//   allGender = ['Men', 'Women', 'Boys', 'Girl', 'Unisex'];
//   allClothing: any;
//   allSubCategory : any;

//   constructor(private authService:AuthService) { }

//   ngOnInit(): void {
//     this.getAllBrands();
//     this.getClothingType();
//     this.getSubCategory();
//     this.getAllProductsClothing();
//     this.getAllProducts();
//   }

//   applyFilters(): void {
//     // Apply filter logic here
//     console.log('Filters applied:', this.filters);
//   }

//   changeProductImage(product: any, color: string): void {
//     product.selectedImageUrl = product.images[color];
//     product.selectedColor = color;
//   }

//   getAllProductsClothing(){
//     this.authService.get('products').subscribe(res=>{
//       if(res){
//         this.allClothing=res.results;
//       }
//     });
//   }
//   getAllProducts(){
//     this.authService.get('products').subscribe(res=>{
//       if(res){
//         this.products=res.results;
//       }
//     });
//   }
  
//   getAllBrands() {
//     this.authService.get(`brand?page=1`).subscribe((res: any) => {
//       this.allBrand = res.results;
//     });
//   }

//   getClothingType(){
//     this.authService.get('clothing-mens').subscribe(res=>{
//       if(res){
//         this.allClothing=res.results;
//       }
//     },(error)=>{
//     console.log(error);
//   })
// }
//   getSubCategory(){
//     const f=this.filters
//     this.authService.get(`sub-category?productType=${f.productType}&clothing=${f.clothing}&gender${f.gender}`).subscribe(res=>{
//       if(res){
//         this.allSubCategory=res.results;
//       }
//     },(error)=>{
//     console.log(error);
//   })
// }
// }
