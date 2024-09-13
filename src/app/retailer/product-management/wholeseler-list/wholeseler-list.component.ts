import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-wholeseler-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './wholeseler-list.component.html',
  styleUrl: './wholeseler-list.component.scss'
})
export class WholeselerListComponent {
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

  bottomAdImage: string = 'https://5.imimg.com/data5/QE/UV/YB/SELLER-56975382/i-will-create-10-sizes-html5-creative-banner-ads.jpg';
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllWholeseler();
  }

  getAllWholeseler() {
    this.authService.get(`retailer/wholesalerslist/${this.user.id}?page=${this.page}&limit=${this.limit}`).subscribe((res: any) => {
      this.allWholeselers = res.docs
      this.totalResults = res.totalDocs
    })
  }


  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllWholeseler();
  }

  navigateToProduct(email: string) {
    this.router.navigate(['/retailer/wholeseler-Products'], {queryParams:{ email: email }});
  }
}
