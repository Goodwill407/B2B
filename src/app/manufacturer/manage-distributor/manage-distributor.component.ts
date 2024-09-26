import { query } from '@angular/animations';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG
import { TooltipModule } from 'primeng/tooltip';


@Component({
  selector: 'app-manage-distributor',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    CommonModule,
    PaginatorModule,
    TooltipModule,
    TableModule,
    MatTabsModule
  ],
  templateUrl: './manage-distributor.component.html',
  styleUrl: './manage-distributor.component.scss'
})
export class ManageDistributorComponent {
  user: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  retailers:any

  constructor(private authService: AuthService, private communicationService:CommunicationService,private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue
    this.getPendingInvitesWholseler();
    this.getPendingInvitesRetailers()
  }

  distributors: any = [];


getPendingInvitesWholseler(searchKey: string = '') {
  this.authService
    .get(
      `manufacturers/get-referred/manufactures?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}&searchKeywords=${searchKey}`
    )
    .subscribe((res: any) => {
      this.distributors = res.results;
      this.totalResults = res.totalResults;

      // Process discounts for each distributor
      this.distributors.forEach((distributor: any) => {
        if (distributor.discountGiven?.length) {
          // Filter discounts for the distributor by email
          const filteredDiscounts = distributor.discountGiven.filter(
            (discount: any) => discount.discountGivenBy === this.user.email
          );

          // Create a comma-separated list of discount categories
          distributor.discountCategories = filteredDiscounts.length
            ? filteredDiscounts.map((discount: any) => discount.category).join(', ') // Corrected from discountCategory to category
            : 'No Discounts';
        } else {
          distributor.discountCategories = 'No Discounts';
        }
      });
    });
}

getPendingInvitesRetailers(searchKey: string = '') {
  this.authService
    .get(
      `manufacturers/get-referred/retailers?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}&searchKeywords=${searchKey}`
    )
    .subscribe((res: any) => {
      this.retailers = res.results;
      this.totalResults = res.totalResults;

      // Process discounts for each retailer
      this.retailers.forEach((retailer: any) => {
        if (retailer.discountGiven?.length) {
          // Filter discounts for the retailer by email
          const filteredDiscounts = retailer.discountGiven.filter(
            (discount: any) => discount.discountGivenBy === this.user.email
          );

          // Create a comma-separated list of discount categories
          retailer.discountCategories = filteredDiscounts.length
            ? filteredDiscounts.map((discount: any) => discount.category).join(', ') // Corrected from discountCategory to category
            : 'No Discounts';
        } else {
          retailer.discountCategories = 'No Discounts';
        }
      });
    });
}




  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getPendingInvitesWholseler();
    this.getPendingInvitesRetailers()
  }
  
  
  changeUserStatus(user: any){
    this.authService.patchWithEmail(`invitations/${user}`,{status:'accepted'}).subscribe((res)=>{
      this.communicationService.showNotification('snackbar-success', 'User status updated successfully','bottom','center');
    });
  }

  viewProfile(distributors:any,role:any){
    this.router.navigate(['/common/view-profile'],{queryParams:{email:distributors.email,role:role,showFlag:'true'}});
  }


  onSearchChange(event: any) {
    const searchKey = event.target.value;
    this.getPendingInvitesWholseler(searchKey);
    this.getPendingInvitesRetailers(searchKey);
}

}
