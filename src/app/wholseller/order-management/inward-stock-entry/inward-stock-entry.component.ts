import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { StudentProgressComponent } from 'app/ui/modal/student-progress/student-progress.component';
import { TableModule } from 'primeng/table';
import { Location } from '@angular/common';
import { DialogformComponent } from 'app/ui/modal/dialogform/dialogform.component';

@Component({
  selector: 'app-inward-stock-entry',
  standalone: true,
  imports: [
    TableModule,
    FormsModule
  ],
  templateUrl: './inward-stock-entry.component.html',
  styleUrl: './inward-stock-entry.component.scss'
})
export class InwardStockEntryComponent {

  inwardStock: any = { products: [] };
  showFlag:boolean = false;
  
  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService,private dialog: MatDialog, private location: Location) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('product');
      if (id) {
        this.authService.get('dilevery-order/' + id).subscribe((res: any) => {
          const filteredProducts = res.products.filter((product: any) => product.status === 'pending');
          if (filteredProducts.length > 0) {
            this.inwardStock = { ...res, products: filteredProducts }; // Assign the filtered products to inwardStock
          } else {
            // Show a message or handle case when no product with 'pending' status
            this.inwardStock = { products: [] }; // No products to display
            this.communicationService.customError1('Product Already Checked for this challan');
            setTimeout(()=>{this.location.back();}, 3000)
          }
        });
      }
    });
  }
  
  openEditDialog(product: any): void {
    const dialogRef = this.dialog.open(DialogformComponent, {
      width: '400px',
      data: product  // Pass the current product data
    });

    dialogRef.afterClosed().subscribe((result:any) => {
      if (result) {
        this.inwardStock.products.map((product: any) => {
          if (product._id === result._id) {
            product.subIssue = String(result.subReason);
            product.issue = result.selectedReason || result.otherIssue;
            product.status = 'issue';
            product.doneChecked = false;
            this.authService.patchWithEmail(`dilevery-order/update/order/status/${this.inwardStock.id}/${product._id}`, {status:'issue'}).subscribe((res: any) => {
              this.showFlag = true;    
            });
          }
        });
      }      
    });
  }

  doneProduct(data: any, event: any) {
    if (data) {
      const isChecked = event.target.checked; // Get the checkbox checked state (true/false)
      
      this.inwardStock.products.map((product: any) => {
        if (product._id === data._id) {
          // Set product status based on the checkbox state
          product.status = isChecked ? 'done' : 'pending'; 
          product.doneChecked = isChecked; // Bind checkbox state to product
  
          this.authService.patchWithEmail(`dilevery-order/update/order/status/${this.inwardStock.id}/${product._id}`, { status: product.status }).subscribe((res: any) => {
            this.showFlag = true;
          });
        }
      });
    }
  }
   
  

  submitDetails(){
    let data = this.inwardStock;
    data.products = data.products.filter((product:any) =>  product.status === 'issue'); // Filter out products with zero quantity or issue

    this.authService.post('issue-products', data).subscribe((res:any)=>{
      this.communicationService.customSuccess('Inward Stock Updated Successfully');
    })
  }
}
