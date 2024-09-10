import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { DialogformComponent } from 'app/ui/modal/dialogform/dialogform.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-return-product',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    AccordionModule,
    CommonModule
  ],
  templateUrl: './return-product.component.html',
  styleUrl: './return-product.component.scss'
})
export class ReturnProductComponent {

  inwardStock: { [key: string]: any[] } = {};
  showFlag: boolean = false;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private dialog: MatDialog) { }

  ngOnInit() {
    this.authService.get(`issue-products?customerEmail=${this.authService.currentUserValue.email}`).subscribe((res: any) => {
      this.inwardStock = res.results.reduce((acc: { [key: string]: any[] }, item: any) => {
        const key = item.companyDetails;  // Grouping by company details
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);  // Add each item (which contains products array) under the corresponding company
        return acc;
      }, {} as { [key: string]: any[] });

    }, (err: any) => {
      this.communicationService.customError(err.error.message);
    });
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  returnProduct(obj: any): void {
    this.openReturnReasonModal();
  }
  openReturnReasonModal() {
    const dialogRef = this.dialog.open(DialogformComponent, {
      width: '400px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected Reason:', result.reason);
        console.log('Selected Sub Reason:', result.subReason);
      }
    });
  }
}
