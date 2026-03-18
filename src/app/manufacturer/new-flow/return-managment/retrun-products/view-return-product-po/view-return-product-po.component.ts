import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-return-product-po',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    RouterModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './view-return-product-po.component.html',
  styleUrl: './view-return-product-po.component.scss'
})
export class ViewReturnProductPoComponent implements OnInit {

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
        this.creditAmount = parseFloat(this.getTotalFinalAmount().toFixed(2));
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

  getItemDiscount(item: any): number {
    const discountPercent = this.returnOrderData?.wholesaler?.productDiscount || 0;
    return (this.getReturnTotalWithGST(item) * discountPercent) / 100;
  }

  getItemFinalAmount(item: any): number {
    return this.getReturnTotalWithGST(item) - this.getItemDiscount(item);
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

  getTotalDiscount(): number {
    return this.returnOrderData?.deliveryItems?.reduce(
      (total: number, item: any) => total + this.getItemDiscount(item), 0) || 0;
  }

  getTotalFinalAmount(): number {
    return this.getTotalReturnWithGST() - this.getTotalDiscount();
  }

  getTotalAcceptedQuantity(): number {
    return this.returnOrderData?.deliveryItems?.reduce((total: number, item: any) => {
      return total + (item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity);
    }, 0) || 0;
  }

  formatCreditAmount(): void {
    if (this.creditAmount) {
      this.creditAmount = parseFloat(this.creditAmount.toFixed(2));
    }
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

  // ─── Decision ─────────────────────────────────────────────────────────────

  submitDecision(): void {
    if (this.submitting) return;

    if (!this.selectedAction) {
      this.communicationService.customError1('Please select an action');
      return;
    }

    if (this.selectedAction === 'approve') {
      if (!this.creditAmount || this.creditAmount <= 0) {
        this.communicationService.customError1('Please enter a valid credit amount');
        return;
      }
      const suggested = parseFloat(this.getTotalFinalAmount().toFixed(2));
      if (this.creditAmount > suggested) {
        this.communicationService.customError1(
          `Credit amount (₹${this.creditAmount}) cannot exceed suggested amount (₹${suggested})`
        );
        return;
      }
      this.approveReturnOrder();
    } else if (this.selectedAction === 'reject') {
      this.rejectReturnOrder();
    }
  }

  // ─── Item Comments ────────────────────────────────────────────────────────

  onCancelReturnItem(item: any, rowIndex: number): void {
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
            <label class="form-label fw-bold">
              <i class="bi bi-box-seam me-1"></i>Accepted Quantity <span class="text-danger">*</span>
            </label>
            <input type="number" id="acceptedQuantity" class="form-control swal2-input"
                   placeholder="Enter accepted quantity"
                   value="${item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity}"
                   min="0" max="${item.returnQuantity}"
                   style="margin:0;width:100%;max-width:100%;">
            <small class="text-muted">Maximum: ${item.returnQuantity}</small>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">
              <i class="bi bi-chat-left-text me-1"></i>Manufacturer Comments <span class="text-danger">*</span>
            </label>
            <textarea id="manufacturerComments" class="form-control swal2-textarea"
                      placeholder="Please provide your comments..."
                      rows="4"
                      style="margin:0;width:100%;max-width:100%;">${item.manufacturerComments || ''}</textarea>
            <small class="text-muted">Minimum 10 characters required</small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const acceptedQty = parseInt((document.getElementById('acceptedQuantity') as HTMLInputElement).value);
        const comments = (document.getElementById('manufacturerComments') as HTMLTextAreaElement).value.trim();

        if (isNaN(acceptedQty) || acceptedQty < 0) {
          Swal.showValidationMessage('Please enter a valid accepted quantity');
          return false;
        }
        if (acceptedQty > item.returnQuantity) {
          Swal.showValidationMessage(`Cannot exceed return quantity (${item.returnQuantity})`);
          return false;
        }
        if (!comments) {
          Swal.showValidationMessage('Please provide comments');
          return false;
        }
        if (comments.length < 10) {
          Swal.showValidationMessage('Please provide more detailed comments (min 10 characters)');
          return false;
        }
        return { acceptedQuantity: acceptedQty, manufacturerComments: comments };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const { acceptedQuantity, manufacturerComments } = result.value;
        const idx = this.returnOrderData.deliveryItems.findIndex((d: any) => d._id === item._id);
        if (idx !== -1) {
          this.returnOrderData.deliveryItems[idx].manufacturerComments = manufacturerComments;
          this.returnOrderData.deliveryItems[idx].acceptedQuantity = acceptedQuantity;
        }
        Swal.fire({
          icon: 'success',
          title: 'Saved Successfully',
          html: `<p>Comments and accepted quantity saved locally.</p>
                 <p class="text-muted small"><strong>Accepted:</strong> ${acceptedQuantity} / ${item.returnQuantity}</p>`,
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  }

  // ─── Approve ──────────────────────────────────────────────────────────────

  approveReturnOrder(): void {
    this.submitting = true;

    const calculatedTotalAmount = parseFloat(this.getTotalFinalAmount().toFixed(2));
    const calculatedCreditAmount = parseFloat(this.creditAmount.toFixed(2));

    const updateData = {
      id: this.returnOrderId,
      totalAmount: calculatedTotalAmount,
      finalAmount: calculatedCreditAmount,
      deliveryItems: this.returnOrderData.deliveryItems.map((item: any) => ({
        ...item,
        manufacturerComments: item.manufacturerComments || '',
        acceptedQuantity: item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity
      }))
    };

    this.authService.patch('return-w2m', updateData).subscribe(
      () => {
        const creditNoteData = {
          invoiceNumber: Number(this.returnOrderData.invoiceNumber),
          invoiceId: this.returnOrderData.invoiceId,
          returnOrderNumber: this.returnOrderData.returnRequestNumber,
          manufacturerEmail: this.returnOrderData.manufacturerEmail,
          wholesalerEmail: this.returnOrderData.wholesalerEmail,
          set: this.returnOrderData.deliveryItems.map((item: any) => ({
            productBy: this.returnOrderData.manufacturerEmail,
            designNumber: item.designNumber,
            colour: item.colour,
            colourImage: item.colourImage || '',
            colourName: item.colourName,
            size: item.size,
            returnQuantity: item.returnQuantity,
            acceptedQuantity: item.acceptedQuantity !== undefined ? item.acceptedQuantity : item.returnQuantity,
            price: item.rate?.toString(),
            productType: item.productType || '',
            gender: item.gender || '',
            clothing: item.clothing || '',
            subCategory: item.subCategory || '',
            quantity: item.returnQuantity,
            returnReason: item.returnReason,
            otherReturnReason: item.otherReturnReason || '',
            hsnCode: item.hsnCode || '',
            hsnGst: item.hsnGst || 0,
            hsnDescription: item.hsnDescription || '',
            brandName: item.brandName || '',
            manufacturerComments: item.manufacturerComments || ''
          })),
          totalCreditAmount: calculatedCreditAmount,
          totalReturnItem: this.getTotalReturnQuantity(),
          totalAcceptedReturnItem: this.getTotalAcceptedQuantity()
        };

        this.authService.post('m-w-credit-note', creditNoteData).subscribe(
          (creditNoteRes: any) => {
            const statusData = { id: this.returnOrderId, statusAll: 'return_approved' };
            this.authService.patch('return-w2m', statusData).subscribe(
              () => {
                this.submitting = false;
                this.communicationService.customSuccess1(
                  `Return order approved! Credit Note #${creditNoteRes.creditNoteNumber || 'generated'} created for ₹${calculatedCreditAmount.toFixed(2)}.`
                );
                this.getReturnOrderDetails();
                setTimeout(() => this.navigateFun(), 2000);
              },
              (error) => {
                this.submitting = false;
                this.communicationService.customError1(
                  error?.error?.message || 'Credit note created but failed to update status.'
                );
              }
            );
          },
          (error) => {
            this.submitting = false;
            this.communicationService.customError1(
              error?.error?.message || 'Failed to create credit note.'
            );
          }
        );
      },
      (error) => {
        this.submitting = false;
        this.communicationService.customError1(
          error?.error?.message || 'Failed to save manufacturer data.'
        );
      }
    );
  }

  // ─── Reject ───────────────────────────────────────────────────────────────

  rejectReturnOrder(): void {
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

    this.authService.patch('return-w2m', updateData).subscribe(
      () => {
        this.submitting = false;
        this.communicationService.customSuccess1('Return order rejected successfully');
        this.getReturnOrderDetails();
        setTimeout(() => this.navigateFun(), 2000);
      },
      (error) => {
        this.submitting = false;
        this.communicationService.customError1(
          error?.error?.message || 'Failed to reject return order.'
        );
      }
    );
  }
}
