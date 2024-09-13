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
    orderDetails: any; // Define the structure of deliveryProduct
  }> = [];

  showFlag: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private dialog: MatDialog) { }

  ngOnInit() {
   this.getProductToAdd();
  }

  getProductToAdd(){
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
  

  addPrice(products: any[], orderDetails: any) {
    let counter = 0; // To track the current product being sent
    const totalProducts = products.length; // Total number of products
  
    products.forEach((product, index) => {
      product.wholesalerEmail = `${this.authService.currentUserValue.email}`;
      this.authService.post('wholesaler-products', product).subscribe(
        (res: any) => {
          console.log(`Product ${index + 1} of ${totalProducts} sent successfully`, res);
        
          counter++;
          if (counter === totalProducts) {
            this.changeStatus(orderDetails.orderId);
          }
        },
        (err: any) => {
          console.error('Error sending product', product, err);
          this.communicationService.customError('Error sending product ' + product.designNumber);
        }
      );
    });
  }
  

  changeStatus(id:any){
    this.authService.patchWithEmail('dilevery-order/'+id,{productStatus:'added'}).subscribe((res:any)=>{
      this.communicationService.customSuccess('Product Added successfully');
      this.getProductToAdd();
    });
  }

  isWholesalerPriceFilled(products: any[]): boolean {
    return products.every(product => product.setOfWholesalerPrice && product.setOfWholesalerPrice > 0);
  }
  
}

