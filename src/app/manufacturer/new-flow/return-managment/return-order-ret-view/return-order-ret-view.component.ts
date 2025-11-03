import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-return-order-ret-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    RouterModule,
    FormsModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './return-order-ret-view.component.html',
  styleUrl: './return-order-ret-view.component.scss'
})
export class ReturnOrderRetViewComponent implements OnInit {

  returnOrderData: any = null;
  loading: boolean = false;
  returnOrderId: string = '';
  selectedAction: string = '';
  creditAmount: number = 0;
  submitting: boolean = false;

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
        // Format to 2 decimal places
        this.creditAmount = parseFloat(this.getTotalReturnWithGST().toFixed(2));
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

  // Format credit amount to 2 decimal places
  formatCreditAmount() {
    if (this.creditAmount) {
      this.creditAmount = parseFloat(this.creditAmount.toFixed(2));
    }
  }

  // Submit decision
  submitDecision() {
    if (this.submitting) return;

    if (!this.selectedAction) {
      this.communicationService.customError1('Please select an action');
      return;
    }

    if (this.selectedAction === 'approve') {
      // Validate credit amount
      if (!this.creditAmount || this.creditAmount <= 0) {
        this.communicationService.customError1('Please enter a valid credit amount');
        return;
      }

      const suggestedAmount = parseFloat(this.getTotalReturnWithGST().toFixed(2));
      
      // Validate credit amount must be less than or equal to suggested amount
      if (this.creditAmount > suggestedAmount) {
        this.communicationService.customError1(
          `Credit amount (₹${this.creditAmount}) cannot exceed the suggested amount (₹${suggestedAmount})`
        );
        return;
      }

      // Call approve function
      this.approveReturnOrder();
    } else if (this.selectedAction === 'reject') {
      // Call reject function
      this.rejectReturnOrder();
    }
  }

  // Approve return order and create credit note
  approveReturnOrder() {
    this.submitting = true;

    // Step 1: Update statusAll to 'return_approved'
    const updateData = {
      id: this.returnOrderId,
      statusAll: 'return_approved'
    };

    this.authService.patch('return-r2m', updateData).subscribe(
      (updateRes: any) => {
        console.log('Return order approved:', updateRes);

        // Step 2: Create credit note
        const creditNoteData = {
          invoiceNumber: this.returnOrderData.invoiceNumber,
          invoiceId: this.returnOrderData.invoiceId,
          manufacturerEmail: this.returnOrderData.manufacturerEmail,
          retailerEmail: this.returnOrderData.retailerEmail,
          set: this.returnOrderData.deliveryItems.map((item: any) => ({
            productBy: this.returnOrderData.manufacturerEmail,
            designNumber: item.designNumber,
            colour: item.colour,
            colourImage: item.colourImage,
            colourName: item.colourName,
            size: item.size,
            returnQuantity: item.returnQuantity,
            acceptedQuantity: item.returnQuantity,
            price: item.rate.toString(),
            productType: item.productType,
            gender: item.gender,
            clothing: item.clothing,
            subCategory: item.subCategory,
            quantity: item.returnQuantity,
            returnReason: item.returnReason,
            otherReturnReason: item.otherReturnReason,
            hsnCode: item.hsnCode,
            hsnGst: item.hsnGst,
            hsnDescription: item.hsnDescription,
            brandName: item.brandName
          })),
          totalCreditAmount: this.creditAmount,
          totalReturnItem: this.getTotalReturnQuantity(),
          totalAcceptedReturnItem: this.getTotalReturnQuantity()
        };

        // Post credit note
        this.authService.post('m-r-credit-note', creditNoteData).subscribe(
          (creditNoteRes: any) => {
            this.submitting = false;
            console.log('Credit note created:', creditNoteRes);
            
            this.communicationService.customSuccess1(
              `Return order approved successfully! Credit Note #${creditNoteRes.creditNoteNumber || 'generated'} created.`
            );
            
            // Refresh the data
            this.getReturnOrderDetails();
            
            // Navigate back after 2 seconds
            setTimeout(() => {
              this.navigateFun();
            }, 2000);
          },
          (error) => {
            this.submitting = false;
            console.error('Error creating credit note:', error);
            this.communicationService.customError1(
              error?.error?.message || 'Failed to create credit note. Please try again.'
            );
          }
        );
      },
      (error) => {
        this.submitting = false;
        console.error('Error approving return order:', error);
        this.communicationService.customError1(
          error?.error?.message || 'Failed to approve return order. Please try again.'
        );
      }
    );
  }

  // Reject return order
  rejectReturnOrder() {
    this.submitting = true;

    const updateData = {
      id: this.returnOrderId,
      statusAll: 'return_rejected'
    };

    this.authService.patch('return-r2m', updateData).subscribe(
      (res: any) => {
        this.submitting = false;
        console.log('Return order rejected:', res);
        
        this.communicationService.customSuccess1('Return order rejected successfully');
        
        // Refresh the data
        this.getReturnOrderDetails();
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          this.navigateFun();
        }, 2000);
      },
      (error) => {
        this.submitting = false;
        console.error('Error rejecting return order:', error);
        this.communicationService.customError1(
          error?.error?.message || 'Failed to reject return order. Please try again.'
        );
      }
    );
  }

  // Existing methods...
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
      case 'credit_note_created':
        return 'Credit Note Created';
      default:
        return status || 'N/A';
    }
  }

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
      case 'credit_note_created':
        return 'badge bg-info';
      default:
        return 'badge bg-secondary';
    }
  }
}
