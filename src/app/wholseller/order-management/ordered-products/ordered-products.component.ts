import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-ordered-products',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    AccordionModule,
    CommonModule
  ],
  templateUrl: './ordered-products.component.html',
  styleUrl: './ordered-products.component.scss'
})
export class OrderedProductsComponent {
  inwardStock: Array<{ 
    manufacturer: string; 
    products: any[]; // This should be an array
    deliveryProduct: { qty: number }; // Define the structure of deliveryProduct
  }> = [];

  showFlag: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private dialog: MatDialog) { }

  ngOnInit() {
    this.authService.get(`dilevery-order/get-ordered/products?customerEmail=${this.authService.currentUserValue.email}`).subscribe(
      (res: any) => {
        // Map the response to extract manufacturer name, matching products, and deliveryProduct data
        this.inwardStock = res.map((order: any) => {
          const manufacturerName = order.matchingProducts[0]?.manufacturerFullName || 'Unknown Manufacturer';
  
          // Update the matching product's quantity with deliveryProduct.qty based on designNumber
          const updatedProducts = order.matchingProducts.map((product: any) => {
            if (product.designNumber === order.deliveryProduct.designNo) {
              return {
                ...product,
                quantity: order.deliveryProduct.qty  // Update the quantity field
              };
            }
            return product;
          });
  
          return {
            manufacturer: manufacturerName,
            products: updatedProducts,  // Use the updated products
            orderDetails: order.orderDetails  // Should have a qty property
          };
        });
  
        console.log(this.inwardStock);
      },
      (err: any) => {
        this.communicationService.customError(err.error.message);
      }
    );
  }
  

  addPrice(obj:any){
    console.log(obj);
    this.authService.post('/wholesaler-products',obj).subscribe((res:any)=>{
      debugger
    })
  }
}

