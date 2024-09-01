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

  constructor(private authService: AuthService, private communicationService:CommunicationService,private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue
    this.getPendingInvites();
  }

  distributors: any = [];

  getPendingInvites(searchKey: string = '') {
    // Modify the API request to include the searchKey parameter
    this.authService.get(`manufacturers/get-referred/manufactures?page=${this.page}&limit=${this.limit}&refByEmail=${this.user.email}&searchKeywords=${searchKey}`).subscribe((res: any) => {
        this.distributors = res.results;
        this.totalResults = res.totalResults;
    });
}

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getPendingInvites();
  }
  
  
  changeUserStatus(user: any){
    this.authService.patchWithEmail(`invitations/${user}`,{status:'accepted'}).subscribe((res)=>{
      this.communicationService.showNotification('snackbar-success', 'User status updated successfully','bottom','center');
    });
  }

  viewProfile(distributors:any){
    this.router.navigate(['/common/view-profile'],{queryParams:{email:distributors.email,role:'wholesaler'}});
  }


  onSearchChange(event: any) {
    const searchKey = event.target.value;
    this.getPendingInvites(searchKey);
}

}
