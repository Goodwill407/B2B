import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-requested-wholesaler-list',
  standalone: true,
  imports: [TableModule,
    PaginatorModule,
    NgIf,
    NgClass, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent],
  templateUrl: './requested-wholesaler-list.component.html',
  styleUrl: './requested-wholesaler-list.component.scss'
})
export class RequestedWholesalerListComponent {
  allWholesaler: any;
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

  bottomAdImage: string = 'https://5.imimg.com/data5/QE/UV/YB/SELLER-56975382/i-will-create-10-sizes-html5-creative-banner-ads.jpg';
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllWholesaler();
  }

  getAllWholesaler(): void {
    // Construct the API endpoint URL dynamically
    const endpoint = `request?requestByEmail=${this.user.email}&page=${this.page}&limit=${this.limit}`;
    
    // Call the API using the authService
    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        // Handle the successful response
        this.allWholesaler = res.results.filter((item: any) => item.status === "pending" || item.status === "rejected");    // Assign the data to the local variable
        this.totalResults = this.allWholesaler.length; // Store the total count of documents
      },
      error: (err: any) => {
        // Handle errors here
        console.error('Error fetching data:', err);
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllWholesaler();
  }
}
