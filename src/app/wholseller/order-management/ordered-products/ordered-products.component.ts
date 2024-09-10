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

  inwardStock: { [key: string]: any[] } = {};
  showFlag: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private dialog: MatDialog) { }

  ngOnInit() {
    this.authService.get(`dilevery-order/get/challan?customerEmail=${this.authService.currentUserValue.email}`).subscribe(
      (res: any) => {
        // Filter the response to only include products with status 'done'
        this.inwardStock = res.reduce((acc: { [key: string]: any[] }, item: any) => {
          const key = item.companyDetails; // Group by company details  
          const filteredProducts = item.products.filter((product: any) => product.status === 'done');
  
          if (filteredProducts.length > 0) {
            if (!acc[key]) {
              acc[key] = [];
            }
  
            acc[key].push({
              ...item,
              products: filteredProducts // Replace the original products with the filtered ones
            });
          }  
          return acc;
        }, {} as { [key: string]: any[] });
  
        console.log(this.inwardStock);
      },
      (err: any) => {
        this.communicationService.customError(err.error.message);
      }
    );
  }
  

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
