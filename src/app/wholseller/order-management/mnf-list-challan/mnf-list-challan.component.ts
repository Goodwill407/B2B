import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-mnf-list-challan',
  standalone: true,
  imports: [
    RouterModule,
    TableModule,
    AccordionModule,
    CommonModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './mnf-list-challan.component.html',
  styleUrl: './mnf-list-challan.component.scss'
})
export class MnfListChallanComponent {
  challan: { [key: string]: any[] } = {};  // Define the type explicitly
  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];
  errMessage:any="";

  constructor(private authService: AuthService, private route: Router, private communicationService: CommunicationService) {}

  ngOnInit() {
    this.authService.get(`dilevery-order/get/challan?customerEmail=${this.authService.currentUserValue.email}`)
      .subscribe((res: any) => {
        console.log('Response received:', res);
      if (!res || Object.keys(res).length === 0) {
        this.challan = {};
        this.errMessage = "No New Order Available";
        console.log('No data available, setting errMessage:', this.errMessage);
        }
        this.challan = res.reduce((acc: { [key: string]: any[] }, item: any) => {
          const key = item.companyDetails;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(item);
          return acc;
        }, {} as { [key: string]: any[] });
        console.log("challan",this.challan);
      }, (err: any) => {
        this.communicationService.customError(err.error.message);
        this.errMessage = "Wholesaler Order List [Server Error]"
      });
  }

  viewDetails(data: any) {
    if (data) {
      this.route.navigate(['/wholesaler/order-mng/view-challan'], {
        queryParams: { product: data.id}
      });
    }
  }

  gotoInventory(data: any) {
    if (data) {
      this.route.navigate(['/wholesaler/order-mng/inward-stock'], {
        queryParams: { product: data.id}
      });
    }
  }
}