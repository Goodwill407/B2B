import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Location } from '@angular/common';

@Component({
  selector: 'app-manufacturer-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './manufacturer-list.component.html',
  styleUrl: './manufacturer-list.component.scss'
})
export class ManufacturerListComponent {

  allMnf: any;
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
  constructor(private authService: AuthService, private router: Router,private location: Location) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllMnf();
  }

  getAllMnf() {
    this.authService.get(`wholesaler/manufactureList/${this.user.email}?page=${this.page}&limit=${this.limit}`).subscribe((res: any) => {
      this.allMnf = res.docs;
      this.totalResults = res.totalDocs;
    })
  }


  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllMnf();
  }

  navigateToProduct(email: string) {
    this.router.navigate(['/wholesaler/product/mnf-product'], {queryParams:{ email: email }});
  }

  navigateFun() {
    this.location.back();
  }
}
