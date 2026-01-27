import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core'; 
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-product-bom',
  standalone: true,
  imports: [CommonModule], // No forms needed for view-only
  templateUrl: './view-product-bom.component.html',
  styleUrl: './view-product-bom.component.scss'
})
export class ViewProductBomComponent implements OnInit {
  
  productId: string = '';
  product: any = null;
  bomData: any = null;
  loading: boolean = true;
  
  // UI State
  activeColorIndex: number = 0;

  // NEW: Image Preview State
  previewImageSrc: string | null = null;
  showImageModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadData();
    }
  }

  loadData() {
    this.loading = true;
    
    // 1. Fetch Product first to get Basic Info & BOM ID
    this.authService.get(`type2-products/${this.productId}`).subscribe({
      next: (prodRes: any) => {
        this.product = prodRes;
        
        if (this.product.bomFilled && this.product.bomId) {
           // 2. Fetch BOM Data
           this.authService.get(`manufacture-bom/${this.product.bomId}`).subscribe({
              next: (bomRes: any) => {
                 this.bomData = bomRes.data || bomRes;
                 this.matchImagesToBomColors();
                 this.loading = false;
              },
              error: (err) => {
                 console.error('Error loading BOM', err);
                 this.loading = false;
              }
           });
        } else {
           console.warn('No BOM found for this product');
           this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error loading Product', err);
        this.loading = false;
      }
    });
  }

   // Helper: Attach hex codes from Product API to the BOM Color objects
  matchImagesToBomColors() {
     if (!this.bomData?.colors || !this.product?.colourCollections) return;

     this.bomData.colors.forEach((bomColor: any) => {
        // Find matching color collection in product
        const matchingProdColor = this.product.colourCollections.find((pc: any) => 
           pc.colourName?.trim().toLowerCase() === bomColor.color?.trim().toLowerCase()
        );
        
        if (matchingProdColor) {
           // Assign the HEX code to the BOM object for display
           bomColor.colorHex = matchingProdColor.colour; 
        } else {
           // Fallback if names don't match perfectly
           bomColor.colorHex = '#ccc'; 
        }
     });
  }


  setActiveTab(index: number) {
    this.activeColorIndex = index;
  }

  goBack() {
    this.location.back();
  }
  
  editBom() {
     this.router.navigate(['/mnf/add-product-bom'], { 
        queryParams: { productId: this.productId } 
     });
  }

  // NEW: Helper methods for Image Modal
  openImagePreview(src: string) {
      if (!src) return;
      this.previewImageSrc = src;
      this.showImageModal = true;
  }
  
  closeImagePreview() {
      this.showImageModal = false;
      this.previewImageSrc = null;
  }
  
}
