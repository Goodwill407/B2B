import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG

@Component({
  selector: 'app-manage-retailer',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule
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

  constructor(private authService: AuthService, private communicationService:CommunicationService,private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue
    this.getPendingInvites();
  }

  getPendingInvites() {
    this.authService.get(`users?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}`).subscribe((res: any) => {
      this.distributors = res.results;
      this.totalResults = res.totalResults;
    })
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getPendingInvites();
  }
  
  distributors: any = [
    { fullName: 'John Doe', companyName: 'ABC Ltd.', mobileNumber: '1234567890', email: 'john@example.com', city: 'New York', country: 'USA', status: 'Active' },
    { fullName: 'Jane Smith', companyName: 'XYZ Inc.', mobileNumber: '0987654321', email: 'jane@example.com', city: 'Los Angeles', country: 'USA', status: 'Inactive' },
    { fullName: 'Michael Brown', companyName: '123 Corp.', mobileNumber: '5678901234', email: 'michael@example.com', city: 'Chicago', country: 'USA', status: 'Active' },
    { fullName: 'Lisa Johnson', companyName: '789 LLC', mobileNumber: '4321098765', email: 'lisa@example.com', city: 'Houston', country: 'USA', status: 'Inactive' }
  ];

  changeUserStatus(user: any){
    this.authService.patchWithEmail(`invitations/${user}`,{status:'accepted'}).subscribe((res)=>{
      this.communicationService.showNotification('snackbar-success', 'User status updated successfully','bottom','center');
    });
  }

  viewProfile(distributors:any){
    this.router.navigate(['/common/view-profile'],{queryParams:{email:distributors.email,role:distributors.role}});
    // this.authService.get(`wholesaler/${distributors.email}`).subscribe((res: any) => {
    //   if (res) {
    //   } else {
    //   }
    // }, error => {
    //   if (error.error.message === "Manufacturer not found") {

    //   }
    // })
  }
}
