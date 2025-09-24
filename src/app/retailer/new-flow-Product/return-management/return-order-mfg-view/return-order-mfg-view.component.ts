import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-return-order-mfg-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './return-order-mfg-view.component.html',
  styleUrl: './return-order-mfg-view.component.scss'
})
export class ReturnOrderMfgViewComponent implements OnInit {

  returnOrderData: any = null; // Return order data
  loading: boolean = false; // Loading state
  returnOrderId: string = ''; // Return order ID from route

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

    const url = `return-r2m/${this.returnOrderId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.returnOrderData = res;
        this.loading = false;
        console.log('Return Order Details:', this.returnOrderData);
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

  // Add this method to your component class
getItemRate(item: any): number {
  // Direct rate from API response
  if (item.rate && typeof item.rate === 'number') {
    return item.rate;
  }
  
  // Fallback calculation if rate is not available
  if (this.returnOrderData?.totalAmount && this.returnOrderData?.totalQuantity) {
    return this.returnOrderData.totalAmount / this.returnOrderData.totalQuantity;
  }
  
  return 0;
}

// Update these methods to handle the API response structure better
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


  // Helper method to get taxable value for return quantity

  // Helper method to format status
  getStatusDisplay(status: string): string {
    switch(status) {
      case 'return_requested':
        return 'Return Requested';
      case 'return_approved':
        return 'Return Approved';
      case 'return_rejected':
        return 'Return Rejected';
      case 'return_completed':
        return 'Return Completed';
      default:
        return status || 'N/A';
    }
  }

  // Helper method to get status class
  getStatusClass(status: string): string {
    switch(status) {
      case 'return_requested':
        return 'badge bg-warning text-dark';
      case 'return_approved':
        return 'badge bg-success';
      case 'return_rejected':
        return 'badge bg-danger';
      case 'return_completed':
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  }
}
