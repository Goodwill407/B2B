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

/// Cancel return item with reason - Frontend only (no API call)
onCancelReturnItem(item: any, rowIndex: number) {
  Swal.fire({
    title: 'Add Manufacturer Comments',
    html: `
      <p class="mb-3">Add comments for this return item</p>
      <p class="text-muted small mb-3"><strong>Item:</strong> ${item.designNumber} - ${item.colourName} - Size ${item.size}</p>
    `,
    input: 'textarea',
    inputLabel: 'Manufacturer Comments',
    inputPlaceholder: 'Please provide your comments for this return item...',
    inputValue: item.manufacturerComments || '', // Pre-fill if already exists
    inputAttributes: {
      'aria-label': 'Type your comments here',
      'rows': '4'
    },
    showCancelButton: true,
    confirmButtonText: 'Save Comments',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#6c757d',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return 'You need to provide comments!'
      }
      if (value.trim().length < 10) {
        return 'Please provide more detailed comments (at least 10 characters)'
      }
      return null;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const manufacturerComments = result.value.trim();
      
      // Update the item in the frontend data only
      const itemIndex = this.returnOrderData.deliveryItems.findIndex(
        (deliveryItem: any) => deliveryItem._id === item._id
      );
      
      if (itemIndex !== -1) {
        this.returnOrderData.deliveryItems[itemIndex].manufacturerComments = manufacturerComments;
      }

      Swal.fire({
        icon: 'success',
        title: 'Comments Saved',
        html: `
          <p>Your comments have been saved locally.</p>
          <p class="text-muted small mt-2">Comments will be sent when you approve or reject the return order.</p>
        `,
        timer: 2500,
        showConfirmButton: false
      });

      console.log('Comments saved locally for item:', item._id, manufacturerComments);
    }
  });
}

// Submit decision - Now sends manufacturerComments
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

  // Step 1: Update return order with manufacturer comments FIRST
  const updateData = {
    id: this.returnOrderId,
    deliveryItems: this.returnOrderData.deliveryItems.map((item: any) => ({
      ...item,
      manufacturerComments: item.manufacturerComments || ''
    }))
  };

  this.authService.patch('return-r2m', updateData).subscribe(
    (updateRes: any) => {
      console.log('Manufacturer comments sent successfully:', updateRes);
      
      // Step 2: Create credit note AFTER comments are saved
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
          brandName: item.brandName,
          manufacturerComments: item.manufacturerComments || '' // Include comments
        })),
        totalCreditAmount: this.creditAmount,
        totalReturnItem: this.getTotalReturnQuantity(),
        totalAcceptedReturnItem: this.getTotalReturnQuantity()
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
      console.error('Error sending manufacturer comments:', error);
      this.communicationService.customError1(
        error?.error?.message || 'Failed to save manufacturer comments. Please try again.'
      );
    }
  );
}

// Reject return order - Now sends manufacturerComments
rejectReturnOrder() {
  this.submitting = true;

  const updateData = {
    id: this.returnOrderId,
    statusAll: 'return_rejected',
    deliveryItems: this.returnOrderData.deliveryItems.map((item: any) => ({
      ...item,
      manufacturerComments: item.manufacturerComments || ''
    }))
  };

  this.authService.patch('return-r2m', updateData).subscribe(
    (res: any) => {
      this.submitting = false;
      console.log('Return order rejected with comments:', res);
      
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


  // Submit decision
  // submitDecision() {
  //   if (this.submitting) return;


  //   if (!this.selectedAction) {
  //     this.communicationService.customError1('Please select an action');
  //     return;
  //   }


  //   if (this.selectedAction === 'approve') {
  //     // Validate credit amount
  //     if (!this.creditAmount || this.creditAmount <= 0) {
  //       this.communicationService.customError1('Please enter a valid credit amount');
  //       return;
  //     }


  //     const suggestedAmount = parseFloat(this.getTotalReturnWithGST().toFixed(2));
      
  //     // Validate credit amount must be less than or equal to suggested amount
  //     if (this.creditAmount > suggestedAmount) {
  //       this.communicationService.customError1(
  //         `Credit amount (₹${this.creditAmount}) cannot exceed the suggested amount (₹${suggestedAmount})`
  //       );
  //       return;
  //     }


  //     // Call approve function
  //     this.approveReturnOrder();
  //   } else if (this.selectedAction === 'reject') {
  //     // Call reject function
  //     this.rejectReturnOrder();
  //   }
  // }


//  // Approve return order and create credit note
// approveReturnOrder() {
//   this.submitting = true;

//   // Step 1: Create credit note FIRST
//   const creditNoteData = {
//     invoiceNumber: this.returnOrderData.invoiceNumber,
//     invoiceId: this.returnOrderData.invoiceId,
//     returnOrderNumber: this.returnOrderData.returnRequestNumber, // Added returnOrderNumber
//     manufacturerEmail: this.returnOrderData.manufacturerEmail,
//     retailerEmail: this.returnOrderData.retailerEmail,
//     set: this.returnOrderData.deliveryItems.map((item: any) => ({
//       productBy: this.returnOrderData.manufacturerEmail,
//       designNumber: item.designNumber,
//       colour: item.colour,
//       colourImage: item.colourImage,
//       colourName: item.colourName,
//       size: item.size,
//       returnQuantity: item.returnQuantity,
//       acceptedQuantity: item.returnQuantity,
//       price: item.rate.toString(),
//       productType: item.productType,
//       gender: item.gender,
//       clothing: item.clothing,
//       subCategory: item.subCategory,
//       quantity: item.returnQuantity,
//       returnReason: item.returnReason,
//       otherReturnReason: item.otherReturnReason,
//       hsnCode: item.hsnCode,
//       hsnGst: item.hsnGst,
//       hsnDescription: item.hsnDescription,
//       brandName: item.brandName,
//       manufacturerComments: item.manufacturerComments || '', // Include comments
//       returnStatus: item.returnStatus || 'requested' // Include status
//     })),
//     totalCreditAmount: this.creditAmount,
//     totalReturnItem: this.getTotalReturnQuantity(),
//     totalAcceptedReturnItem: this.getTotalReturnQuantity()
//   };

//   // Post credit note FIRST
//   this.authService.post('m-r-credit-note', creditNoteData).subscribe(
//     (creditNoteRes: any) => {
//       console.log('Credit note created successfully:', creditNoteRes);
      
//       // Step 2: Only after successful credit note creation, update statusAll to 'return_approved'
//       const updateData = {
//         id: this.returnOrderId,
//         statusAll: 'return_approved'
//       };

//       this.authService.patch('return-r2m', updateData).subscribe(
//         (updateRes: any) => {
//           this.submitting = false;
//           console.log('Return order status updated to approved:', updateRes);
          
//           this.communicationService.customSuccess1(
//             `Return order approved successfully! Credit Note #${creditNoteRes.creditNoteNumber || 'generated'} created.`
//           );
          
//           // Refresh the data
//           this.getReturnOrderDetails();
          
//           // Navigate back after 2 seconds
//           setTimeout(() => {
//             this.navigateFun();
//           }, 2000);
//         },
//         (error) => {
//           this.submitting = false;
//           console.error('Error updating return order status:', error);
//           this.communicationService.customError1(
//             error?.error?.message || 'Credit note created but failed to update return order status. Please contact support.'
//           );
//         }
//       );
//     },
//     (error) => {
//       this.submitting = false;
//       console.error('Error creating credit note:', error);
//       this.communicationService.customError1(
//         error?.error?.message || 'Failed to create credit note. Please try again.'
//       );
//     }
//   );
// }


  // Reject return order
  // rejectReturnOrder() {
  //   this.submitting = true;


  //   const updateData = {
  //     id: this.returnOrderId,
  //     statusAll: 'return_rejected'
  //   };


  //   this.authService.patch('return-r2m', updateData).subscribe(
  //     (res: any) => {
  //       this.submitting = false;
  //       console.log('Return order rejected:', res);
        
  //       this.communicationService.customSuccess1('Return order rejected successfully');
        
  //       // Refresh the data
  //       this.getReturnOrderDetails();
        
  //       // Navigate back after 2 seconds
  //       setTimeout(() => {
  //         this.navigateFun();
  //       }, 2000);
  //     },
  //     (error) => {
  //       this.submitting = false;
  //       console.error('Error rejecting return order:', error);
  //       this.communicationService.customError1(
  //         error?.error?.message || 'Failed to reject return order. Please try again.'
  //       );
  //     }
  //   );
  // }


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
}
