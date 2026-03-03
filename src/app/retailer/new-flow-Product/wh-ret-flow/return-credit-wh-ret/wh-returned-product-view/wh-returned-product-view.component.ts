import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-wh-returned-product-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './wh-returned-product-view.component.html',
  styleUrl: './wh-returned-product-view.component.scss'
})
export class WhReturnedProductViewComponent implements OnInit {

  returnOrderData: any = null;
  loading: boolean = false;
  returnOrderId: string = '';

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.returnOrderId = this.route.snapshot.params['id'];
    if (this.returnOrderId) {
      this.getReturnOrderDetails();
    }
  }

  getReturnOrderDetails() {
    this.loading = true;

    const url = `return-r2w/${this.returnOrderId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.returnOrderData = res;
        this.loading = false;
        console.log('WHL Return Order Details:', this.returnOrderData);
      },
      (error) => {
        console.error('Error fetching return order details:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load return order details');
      }
    );
  }

  navigateFun() {
    this.location.back();
  }

  getItemRate(item: any): number {
    if (item.rate && typeof item.rate === 'number') {
      return item.rate;
    }
    if (this.returnOrderData?.totalAmount && this.returnOrderData?.totalQuantity) {
      return this.returnOrderData.totalAmount / this.returnOrderData.totalQuantity;
    }
    return 0;
  }

  getReturnTaxableValue(item: any): number {
    const rate = this.getItemRate(item);
    return rate * (item.returnQuantity || 0);
  }

  getReturnTotalWithGST(item: any): number {
    const taxableValue = this.getReturnTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  getTotalReturnQuantity(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + (item.returnQuantity || 0);
    }, 0);
  }

  getTotalReturnTaxableValue(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + this.getReturnTaxableValue(item);
    }, 0);
  }

  getTotalReturnWithGST(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + this.getReturnTotalWithGST(item);
    }, 0);
  }

  getReturnItemFinalAmount(item: any): number {
    const totalWithGST = this.getReturnTotalWithGST(item);
    const discountPercent = Number(this.returnOrderData?.retailer?.productDiscount) || 0;
    const discountAmount = (totalWithGST * discountPercent) / 100;
    return totalWithGST - discountAmount;
  }

  getReturnItemDiscount(item: any): number {
    const totalWithGST = this.getReturnTotalWithGST(item);
    const discountPercent = Number(this.returnOrderData?.retailer?.productDiscount) || 0;
    return (totalWithGST * discountPercent) / 100;
  }

  getTotalReturnFinalAmount(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + this.getReturnItemFinalAmount(item);
    }, 0);
  }

  getTotalReturnDiscount(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + this.getReturnItemDiscount(item);
    }, 0);
  }

  getOriginalTotalQuantity(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + (item.orderQuantity || 0);
    }, 0);
  }

  // All 8 ReturnR2W schema statuses
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'return_requested':
        return 'Return Requested';
      case 'return_checked':
        return 'Return Checked';
      case 'return_approved':
        return 'Return Approved';
      case 'return_rejected':
        return 'Return Rejected';
      case 'return_in_transit':
        return 'Return In Transit';
      case 'return_received':
        return 'Return Received';
      case 'credit_note_created':
        return 'Credit Note Created';
      case 'resolved':
        return 'Resolved';
      default:
        return status || 'N/A';
    }
  }

  // All 8 ReturnR2W schema statuses
  getStatusClass(status: string): string {
    switch (status) {
      case 'return_requested':
        return 'badge bg-warning text-dark';
      case 'return_checked':
        return 'badge bg-info text-dark';
      case 'return_approved':
        return 'badge bg-success';
      case 'return_rejected':
        return 'badge bg-danger';
      case 'return_in_transit':
        return 'badge bg-primary';
      case 'return_received':
        return 'badge bg-secondary';
      case 'credit_note_created':
        return 'badge bg-purple text-white';
      case 'resolved':
        return 'badge bg-dark';
      default:
        return 'badge bg-secondary';
    }
  }
}
