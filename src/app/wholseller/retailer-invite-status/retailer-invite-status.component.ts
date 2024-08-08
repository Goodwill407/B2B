import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailer-invite-status',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retailer-invite-status.component.html',
  styleUrl: './retailer-invite-status.component.scss'
})
export class RetailerInviteStatusComponent {
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

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';

  constructor(private authService: AuthService, private communicationService:CommunicationService) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue
    this.getPendingInvites();
  }

  getPendingInvites() {
    // this.authService.get(`invitations?page=${this.page}&limit=${this.limit}&status=pending&invitedBy=${this.user.email}`).subscribe((res: any) => {
    //   this.distributors = res.results;
    //   this.totalResults = res.totalResults;
    // })
  }

  reInvite(data: any) {
    this.authService.get(`invitations/re-invitation/${data.email}`).subscribe((res: any) =>{
      this.communicationService.showNotification('snackbar-success','Re-invitation Sent Successfully','bottom','center');
    });
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

}

