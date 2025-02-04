import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-retailer-whol-associated-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent  
  ],
  templateUrl: './retailer-whol-associated-list.component.html',
  styleUrl: './retailer-whol-associated-list.component.scss'
})
export class RetailerWholAssociatedListComponent {

    allWholeselers: any;
    totalResults: any;
    limit = 10;
    page: number = 1
    first: number = 0;
    rows: number = 10;
    user: any;
  
  
     // for ads
     rightAdImages: string[] = [
      'https://en.pimg.jp/081/115/951/1/81115951.jpg',
      'https://en.pimg.jp/087/336/183/1/87336183.jpg'
    ];
  
    bottomAdImage: string[] = [
      'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
    ];
    constructor(private authService: AuthService, private router: Router) { }
  
    ngOnInit() {
      this.user = this.authService.currentUserValue;
      this.getAllWholeseler();
    }
  
    getAllWholeseler() {
      this.authService.get(`retailer/wholesalerslist/${this.user.id}?page=${this.page}&limit=${this.limit}?userCategory=${this.user.userCategory}`).subscribe((res: any) => {
        this.allWholeselers = res.docs
        this.totalResults = res.totalDocs
      })
    }
  
  
    onPageChange(event: any) {
      this.page = event.page + 1;
      this.limit = event.rows;
      this.getAllWholeseler();
    }
  
    navigateToProfile(id: string,email:any,requestDetailsObject:any) {
      // Navigate to the target route with email as query parameter
      this.router.navigate(['/retailer/view-wholesaler-details'], { queryParams: { id: id ,email:email,RequestDetails: JSON.stringify(requestDetailsObject)} });
    }
  }
