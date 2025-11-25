import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';


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
      // CHANGE THIS LINE: Use getTotalFinalAmount() instead of getTotalReturnWithGST()
      this.creditAmount = parseFloat(this.getTotalFinalAmount().toFixed(2));
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
 
// Submit decision - Now validates against getTotalFinalAmount()
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

    // CHANGE THIS LINE: Validate against getTotalFinalAmount() instead of getTotalReturnWithGST()
    const suggestedAmount = parseFloat(this.getTotalFinalAmount().toFixed(2));
    
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

formatCreditAmount() {
  if (this.creditAmount) {
    this.creditAmount = parseFloat(this.creditAmount.toFixed(2));
  }
}

  getReturnTotalWithGST(item: any): number {
    const taxableValue = this.getReturnTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  // Calculate item discount amount
  getItemDiscount(item: any): number {
    const totalWithGST = this.getReturnTotalWithGST(item);
    const discountPercent = this.returnOrderData?.retailer?.productDiscount || 0;
    return (totalWithGST * discountPercent) / 100;
  }

  // Calculate final amount after discount for item
  getItemFinalAmount(item: any): number {
    const totalWithGST = this.getReturnTotalWithGST(item);
    const discount = this.getItemDiscount(item);
    return totalWithGST - discount;
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

  // Calculate total discount
  getTotalDiscount(): number {
    if (!this.returnOrderData?.deliveryItems) return 0;
    return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
      return total + this.getItemDiscount(item);
    }, 0);
  }

  // Calculate total final amount after discount
  getTotalFinalAmount(): number {
    const totalWithGST = this.getTotalReturnWithGST();
    const totalDiscount = this.getTotalDiscount();
    return totalWithGST - totalDiscount;
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

  // Cancel return item with reason - Now includes acceptedQuantity input
onCancelReturnItem(item: any, rowIndex: number) {
  Swal.fire({
    title: 'Add Manufacturer Comments',
    html: `
      <div class="text-start">
        <p class="mb-3">Add comments and accepted quantity for this return item</p>
        <p class="text-muted small mb-3">
          <strong>Item:</strong> ${item.designNumber} - ${item.colourName} - Size ${item.size}<br>
          <strong>Return Quantity:</strong> ${item.returnQuantity}
        </p>
        
        <div class="mb-3">
          <label for="acceptedQuantity" class="form-label fw-bold">
            <i class="bi bi-box-seam me-1"></i>Accepted Quantity <span class="text-danger">*</span>
          </label>
          <input 
            type="number" 
            id="acceptedQuantity" 
            class="form-control swal2-input" 
            placeholder="Enter accepted quantity"
            value="${item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity}"
            min="0"
            max="${item.returnQuantity}"
            style="margin: 0; width: 100%; max-width: 100%;">
          <small class="text-muted">Maximum: ${item.returnQuantity}</small>
        </div>
        
        <div class="mb-3">
          <label for="manufacturerComments" class="form-label fw-bold">
            <i class="bi bi-chat-left-text me-1"></i>Manufacturer Comments <span class="text-danger">*</span>
          </label>
          <textarea 
            id="manufacturerComments" 
            class="form-control swal2-textarea" 
            placeholder="Please provide your comments for this return item..."
            rows="4"
            style="margin: 0; width: 100%; max-width: 100%;">${item.manufacturerComments || ''}</textarea>
          <small class="text-muted">Minimum 10 characters required</small>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    customClass: {
      popup: 'swal-wide',
      htmlContainer: 'text-start'
    },
    preConfirm: () => {
      const acceptedQuantityInput = document.getElementById('acceptedQuantity') as HTMLInputElement;
      const commentsInput = document.getElementById('manufacturerComments') as HTMLTextAreaElement;
      
      const acceptedQuantity = parseInt(acceptedQuantityInput.value);
      const comments = commentsInput.value.trim();
      
      // Validation
      if (!acceptedQuantityInput.value || acceptedQuantity < 0) {
        Swal.showValidationMessage('Please enter a valid accepted quantity');
        return false;
      }
      
      if (acceptedQuantity > item.returnQuantity) {
        Swal.showValidationMessage(`Accepted quantity cannot exceed return quantity (${item.returnQuantity})`);
        return false;
      }
      
      if (!comments) {
        Swal.showValidationMessage('Please provide comments');
        return false;
      }
      
      if (comments.length < 10) {
        Swal.showValidationMessage('Please provide more detailed comments (at least 10 characters)');
        return false;
      }
      
      return {
        acceptedQuantity: acceptedQuantity,
        manufacturerComments: comments
      };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { acceptedQuantity, manufacturerComments } = result.value;
      
      // Update the item in the frontend data
      const itemIndex = this.returnOrderData.deliveryItems.findIndex(
        (deliveryItem: any) => deliveryItem._id === item._id
      );
      
      if (itemIndex !== -1) {
        this.returnOrderData.deliveryItems[itemIndex].manufacturerComments = manufacturerComments;
        this.returnOrderData.deliveryItems[itemIndex].acceptedQuantity = acceptedQuantity;
      }

      Swal.fire({
        icon: 'success',
        title: 'Saved Successfully',
        html: `
          <p>Your comments and accepted quantity have been saved locally.</p>
          <p class="text-muted small mt-2">
            <strong>Accepted Quantity:</strong> ${acceptedQuantity} / ${item.returnQuantity}<br>
            Data will be sent when you approve or reject the return order.
          </p>
        `,
        timer: 3000,
        showConfirmButton: false
      });

      console.log('Saved locally for item:', item._id, {
        acceptedQuantity,
        manufacturerComments
      });
    }
  });
}

approveReturnOrder() {
  this.submitting = true;

  // Calculate amounts
  const calculatedTotalAmount = parseFloat(this.getTotalFinalAmount().toFixed(2));
  const calculatedCreditAmount = parseFloat(this.creditAmount.toFixed(2));

  // Step 1: Update return order with manufacturer comments, acceptedQuantity, and amounts
  const updateData = {
    id: this.returnOrderId,
    totalAmount: calculatedTotalAmount,  // Total return amount (getTotalFinalAmount)
    finalAmount: calculatedCreditAmount,  // Credit note amount (user input)
    deliveryItems: this.returnOrderData.deliveryItems.map((item: any) => ({
      ...item,
      manufacturerComments: item.manufacturerComments || '',
      acceptedQuantity: item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity
    }))
  };

  this.authService.patch('return-r2m', updateData).subscribe(
    (updateRes: any) => {
      console.log('Manufacturer comments, accepted quantities, and amounts sent successfully:', updateRes);
      
      // Step 2: Create credit note AFTER data is saved
      const creditNoteData = {
        invoiceNumber: this.returnOrderData.invoiceNumber,
        invoiceId: this.returnOrderData.invoiceId,
        returnOrderNumber: this.returnOrderData.returnRequestNumber,
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
          acceptedQuantity: item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity,
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
          brandName: item.brandName,
          manufacturerComments: item.manufacturerComments || ''
        })),
        totalCreditAmount: calculatedCreditAmount,
        totalReturnItem: this.getTotalReturnQuantity(),
        totalAcceptedReturnItem: this.getTotalAcceptedQuantity()
      };

      // Post credit note
      this.authService.post('m-r-credit-note', creditNoteData).subscribe(
        (creditNoteRes: any) => {
          console.log('Credit note created successfully:', creditNoteRes);
          
          // Step 3: Update statusAll to 'return_approved'
          const statusUpdateData = {
            id: this.returnOrderId,
            statusAll: 'return_approved'
          };

          this.authService.patch('return-r2m', statusUpdateData).subscribe(
            (statusRes: any) => {
              this.submitting = false;
              console.log('Return order status updated to approved:', statusRes);
              
              this.communicationService.customSuccess1(
                `Return order approved successfully! Credit Note #${creditNoteRes.creditNoteNumber || 'generated'} created for ₹${calculatedCreditAmount.toFixed(2)}.`
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
              console.error('Error updating return order status:', error);
              this.communicationService.customError1(
                error?.error?.message || 'Credit note created but failed to update return order status.'
              );
            }
          );
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
      console.error('Error sending manufacturer data:', error);
      this.communicationService.customError1(
        error?.error?.message || 'Failed to save manufacturer data. Please try again.'
      );
    }
  );
}

// Reject return order - Now sends manufacturerComments and acceptedQuantity
rejectReturnOrder() {
  this.submitting = true;

  const updateData = {
    id: this.returnOrderId,
    statusAll: 'return_rejected',
    deliveryItems: this.returnOrderData.deliveryItems.map((item: any) => ({
      ...item,
      manufacturerComments: item.manufacturerComments || '',
      acceptedQuantity: item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity
    }))
  };

  this.authService.patch('return-r2m', updateData).subscribe(
    (res: any) => {
      this.submitting = false;
      console.log('Return order rejected with comments and accepted quantities:', res);
      
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

// Add this helper method to calculate total accepted quantity
getTotalAcceptedQuantity(): number {
  if (!this.returnOrderData?.deliveryItems) return 0;
  return this.returnOrderData.deliveryItems.reduce((total: number, item: any) => {
    const acceptedQty = item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity;
    return total + acceptedQty;
  }, 0);
}

}
