import { NgClass, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-manage-retailer',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent,
    NgClass
  ],
  templateUrl: './manage-retailer.component.html',
  styleUrl: './manage-retailer.component.scss'
})
export class ManageRetailerComponent {
  user: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;

  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];
  searchPerformed: boolean = false;


  constructor(private authService: AuthService, private communicationService:CommunicationService,private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue
    this.getPendingInvites();
  }

  // getPendingInvites() {
  //   this.authService.get(`wholesaler//get-referred/retailer?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}`).subscribe((res: any) => {
  //     this.distributors = res.results;
  //     this.totalResults = res.totalResults;
  //   })
  // }

  getPendingInvites(searchKey: string = '') {
    this.authService
      .get(
        `wholesaler/get-referred/retailer?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}&searchKeywords=${searchKey}`
      )
      .subscribe(
        (res: any) => {
          this.distributors = res.results || [];
          this.totalResults = res.totalResults || 0;
  
          // Process discounts for each distributor
          this.distributors.forEach((distributor: any) => {
            if (distributor.discountGiven?.length) {
              // Filter discounts for the distributor by email
              const filteredDiscounts = distributor.discountGiven.filter(
                (discount: any) => discount.discountGivenBy === this.user.email
              );
  
              // Create a comma-separated list of discount categories
              distributor.discountCategories = filteredDiscounts.length
                ? filteredDiscounts.map((discount: any) => discount.category).join(', ')
                : 'No Discounts';
            } else {
              distributor.discountCategories = 'No Discounts';
            }
          });
        },
        (error) => {
          // console.error('Error fetching retailers:', error);
          this.distributors = [];
          this.totalResults = 0;
        }
      );
  }
  

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getPendingInvites();
  }
  
  distributors: any [] = [];

  changeUserStatus(user: any){
    this.authService.patchWithEmail(`invitations/${user}`,{status:'accepted'}).subscribe((res)=>{
      this.communicationService.showNotification('snackbar-success', 'User status updated successfully','bottom','center');
    });
  }
  viewProfile(distributor: any) {  // discountCategories: any
    this.router.navigate(['/common/view-profile'], {
      queryParams: { 
        email: distributor.email, 
        role: 'retailer',
        // discountCategories: discountCategories // Pass discountCategories as a query parameter
       },
    });
  }
 
  onSearchChange(event: any) {
    this.searchPerformed = true;
    const searchKey = event.target.value.trim();
    this.page = 1; // Reset to the first page on new search
    this.getPendingInvites(searchKey);
  }
  


}
