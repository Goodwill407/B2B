import { NgIf,Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-list-of-asso-mfg',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './list-of-asso-mfg.component.html',
  styleUrl: './list-of-asso-mfg.component.scss'
})
export class ListOfAssoMfgComponent {

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

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];

  constructor(private authService: AuthService, private router: Router,private location: Location) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllMnf();
  }

  getAllMnf() {
    this.authService.get(`retailer/manufactureList/${this.user.id}?page=${this.page}&limit=${this.limit}&userCategory=orderwise`).subscribe((res: any) => {
      this.allMnf = res.docs;
      this.totalResults = res.totalDocs;
    })
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllMnf();
  }

  navigateToProduct(email: string,CompanyName: string) {
    this.router.navigate(['/wholesaler/new/product/mnf-product'], {queryParams:{ email: email, CompanyName: CompanyName}});
  }

  navigateFun() {
    this.location.back();
  }

}
