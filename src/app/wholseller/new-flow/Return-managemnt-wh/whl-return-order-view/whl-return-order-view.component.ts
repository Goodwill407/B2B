import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-whl-return-order-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './whl-return-order-view.component.html',
  styleUrl: './whl-return-order-view.component.scss'
})
export class WhlReturnOrderViewComponent implements OnInit {

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
  ) {}

  ngOnInit(): void {
    this.returnOrderId = this.route.snapshot.params['id'];
    if (this.returnOrderId) {
      this.getReturnOrderDetails();
    }
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  getReturnOrderDetails(): void {
    this.loading = true;
    this.authService.get(`return-w2m/${this.returnOrderId}`).subscribe(
      (res: any) => {
        this.returnOrderData = res;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching return order details:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load return order details');
      }
    );
  }

  navigateFun(): void {
    this.location.back();
  }

  // ─── Calculations ─────────────────────────────────────────────────────────

  getItemRate(item: any): number {
    if (item.rate && typeof item.rate === 'number') return item.rate;
    if (this.returnOrderData?.totalAmount && this.returnOrderData?.totalQuantity) {
      return this.returnOrderData.totalAmount / this.returnOrderData.totalQuantity;
    }
    return 0;
  }

  getReturnTaxableValue(item: any): number {
    return this.getItemRate(item) * (item.returnQuantity || 0);
  }

  getReturnTotalWithGST(item: any): number {
    return this.getReturnTaxableValue(item) * (1 + (item.hsnGst || 0) / 100);
  }

  getReturnItemDiscount(item: any): number {
    const discountPercent = Number(this.returnOrderData?.wholesaler?.productDiscount) || 0;
    return (this.getReturnTotalWithGST(item) * discountPercent) / 100;
  }

  getReturnItemFinalAmount(item: any): number {
    return this.getReturnTotalWithGST(item) - this.getReturnItemDiscount(item);
  }

  getTotalReturnQuantity(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + (item.returnQuantity || 0), 0) || 0;
  }

  getTotalReturnTaxableValue(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + this.getReturnTaxableValue(item), 0) || 0;
  }

  getTotalReturnWithGST(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + this.getReturnTotalWithGST(item), 0) || 0;
  }

  getTotalReturnDiscount(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + this.getReturnItemDiscount(item), 0) || 0;
  }

  getTotalReturnFinalAmount(): number {
    return this.getTotalReturnWithGST() - this.getTotalReturnDiscount();
  }

  getOriginalTotalQuantity(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + (item.orderQuantity || 0), 0) || 0;
  }

  // ─── Status Helpers ───────────────────────────────────────────────────────

  getStatusDisplay(status: string): string {
    const map: { [key: string]: string } = {
      'return_requested':    'Return Requested',
      'return_checked':      'Return Checked',
      'return_approved':     'Return Approved',
      'return_rejected':     'Return Rejected',
      'return_in_transit':   'Return In Transit',
      'return_received':     'Return Received',
      'credit_note_created': 'Credit Note Created',
      'resolved':            'Resolved'
    };
    return map[status] || status || 'N/A';
  }

  getStatusClass(status: string): string {
    const map: { [key: string]: string } = {
      'return_requested':    'badge bg-warning text-dark',
      'return_checked':      'badge bg-info text-dark',
      'return_approved':     'badge bg-success',
      'return_rejected':     'badge bg-danger',
      'return_in_transit':   'badge bg-primary',
      'return_received':     'badge bg-secondary',
      'credit_note_created': 'badge bg-info',
      'resolved':            'badge bg-dark'
    };
    return map[status] || 'badge bg-secondary';
  }
}
