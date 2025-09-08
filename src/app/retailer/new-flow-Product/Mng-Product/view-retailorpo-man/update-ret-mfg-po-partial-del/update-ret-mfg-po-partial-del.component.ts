import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import Swal from 'sweetalert2';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-update-ret-mfg-po-partial-del',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    IndianCurrencyPipe, AmountInWordsPipe
  ],
  templateUrl: './update-ret-mfg-po-partial-del.component.html',
  styleUrl: './update-ret-mfg-po-partial-del.component.scss'
})
export class UpdateRetMfgPoPartialDelComponent implements OnInit {
  // Data Properties
  responseData: any;
  purchaseOrder: any = {};
  confirmedItems: any[] = [];
  makeToOrderItems: any[] = [];
  
  // UI Properties
  isLoading: boolean = false;
  isIntraState: boolean = false;
  bankDetails: any;

  manufacturerNote: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    const poId = this.route.snapshot.paramMap.get('id');
    if (poId) {
      this.loadPOData(poId);
    }
  }

  loadPOData(poId: string) {
    this.isLoading = true;
    const url = `po-retailer-to-manufacture/${poId}`;
    
    this.authService.get(url).subscribe({
      next: (res: any) => {
        this.responseData = res;
        this.setupPOData(res);
        this.separateItems(res.set);
        this.updateStateType();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading PO data:', err);
        this.communicationService.customError1('Failed to load purchase order data');
        this.isLoading = false;
      }
    });
  }

  setupPOData(res: any) {
    this.purchaseOrder = {
      supplierName: res.manufacturer?.companyName || '',
      supplierAddress: `${res.manufacturer?.address}, ${res.manufacturer?.pinCode} - ${res.manufacturer?.state}`,
      supplierContact: res.manufacturer?.mobNumber || '',
      supplierGSTIN: res.manufacturer?.GSTIN || '',
      supplierEmail: res.manufacturer?.email || '',
      supplierPAN: '',

      buyerName: res.retailer?.companyName || '',
      buyerAddress: `${res.retailer?.address}, ${res.retailer?.pinCode} - ${res.retailer?.state}`,
      buyerPhone: res.retailer?.mobNumber || '',
      buyerEmail: res.retailer?.email || '',
      buyerGSTIN: res.retailer?.GSTIN || '',
      buyerPAN: '',

      logoUrl: res.retailer?.logo || '',
      poDate: new Date(res.retailerPoDate).toLocaleDateString(),
      orderNumber: res.poNumber,
      ProductDiscount: parseFloat(res.discount || 0),
      transportDetails: res.transportDetails,
      expDeliveryDate: res.expDeliveryDate,
      partialDeliveryDate: res.partialDeliveryDate
    };

    this.manufacturerNote = res.manufacturerNote || res.note || res.manufacturer?.notes || '';

    // Bank details
    if (res.bankDetails) {
      this.bankDetails = res.bankDetails;
    }
  }

  // UPDATED: Correct logic for splitting items
  separateItems(items: any[]) {
    this.confirmedItems = [];
    this.makeToOrderItems = [];

    items.forEach(item => {
      // Add to confirmed table if available quantity > 0
      if (item.availableQuantity > 0) {
        this.confirmedItems.push({
          ...item,
          quantity: item.availableQuantity, // Show available quantity in confirmed table
          expectedQty: item.quantity,
        });
      }

      // Calculate remaining quantity for make-to-order
      const remainingQty = item.quantity - item.availableQuantity;
      if (remainingQty > 0) {
        this.makeToOrderItems.push({
          ...item,
          remainingQuantity: remainingQty // Show remaining quantity in make-to-order table
        });
      }
    });
  }

  updateStateType() {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = buyerState && supplierState && (buyerState === supplierState);
  }

  // GST Calculation Methods
  getGstAmounts(item: any, useRemainingQty: boolean = false) {
    const quantity = useRemainingQty ? item.remainingQuantity : item.quantity;
    const rate = +item.price;
    const taxable = quantity * rate;
    const gstRate = +item.hsnGst;

    let cgst = 0, sgst = 0, igst = 0;

    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }

    const totalWithGst = taxable + cgst + sgst + igst;
    return { taxable, gstRate, cgst, sgst, igst, totalWithGst };
  }

  // Table Totals
  get confirmedTotals() {
    let totalQty = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalWithGST = 0;

    for (const item of this.confirmedItems) {
      const gst = this.getGstAmounts(item);
      totalQty += Number(item.quantity) || 0;
      totalTaxable += gst.taxable || 0;
      totalCGST += gst.cgst || 0;
      totalSGST += gst.sgst || 0;
      totalIGST += gst.igst || 0;
      totalWithGST += gst.totalWithGst || 0;
    }

    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountAmount = (totalWithGST * discountPercent) / 100;
    const actualGrandTotal = totalWithGST - discountAmount;

    return { 
      totalQty, totalTaxable, totalCGST, totalSGST, totalIGST, 
      totalWithGST, discountAmount, actualGrandTotal 
    };
  }

  get makeToOrderTotals() {
    let totalQty = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalWithGST = 0;

    for (const item of this.makeToOrderItems) {
      const gst = this.getGstAmounts(item, true); // Use remaining quantity
      totalQty += Number(item.remainingQuantity) || 0;
      totalTaxable += gst.taxable || 0;
      totalCGST += gst.cgst || 0;
      totalSGST += gst.sgst || 0;
      totalIGST += gst.igst || 0;
      totalWithGST += gst.totalWithGst || 0;
    }

    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountAmount = (totalWithGST * discountPercent) / 100;
    const actualGrandTotal = totalWithGST - discountAmount;

    return { 
      totalQty, totalTaxable, totalCGST, totalSGST, totalIGST, 
      totalWithGST, discountAmount, actualGrandTotal 
    };
  }

  get totalGSTAmountConfirmed(): number {
    const totals = this.confirmedTotals;
    return totals.totalCGST + totals.totalSGST + totals.totalIGST;
  }

  get totalGSTAmountMakeToOrder(): number {
    const totals = this.makeToOrderTotals;
    return totals.totalCGST + totals.totalSGST + totals.totalIGST;
  }

  get colspan(): number {
    return this.isIntraState ? 16 : 15;
  }

  // Delete functionality for make to order items
  removeFromMakeToOrder(index: number) {
    this.makeToOrderItems.splice(index, 1);
    this.communicationService.customSuccess('Item removed from Make to Order list');
  }

  // Navigation
  navigateFun() {
    this.location.back();
  }

  // Date formatting
  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  // ========== SUBMISSION LOGIC WITH SWEETALERT2 ==========

  // Property for selected action
  selectedAction: string | null = null;

  // SweetAlert2 Confirmation Dialog
  async showConfirmation(action: string): Promise<boolean> {
    let title = '';
    let text = '';
    
    switch(action) {
      case 'acceptBoth':
        title = 'Accept Both Available and Make-to-Order Items?';
        text = 'This will update the current PO with available items and create a new Make-to-Order PO for remaining items.';
        break;
      case 'acceptConfirmed':
        title = 'Accept Only Available Items?';
        text = 'This will update the PO with available items only. Make-to-Order items will be cancelled.';
        break;
      case 'rejectAll':
        title = 'Cancel Entire Order?';
        text = 'This will cancel the complete purchase order. This action cannot be undone.';
        break;
    }

    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    });
    
    return result.isConfirmed;
  }

  // Success Messages
  showSuccessMessage(action: string) {
    let message = '';
    
    switch(action) {
      case 'acceptBoth':
        message = 'Order Updated and New Make to Order created';
        break;
      case 'acceptConfirmed':
        message = 'Order updated successfully';
        break;
      case 'rejectAll':
        message = 'Order cancelled successfully';
        break;
    }
    
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Error Messages
  showErrorMessage(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message || 'Something went wrong. Please try again.',
      confirmButtonColor: '#007bff'
    });
  }

  // Main Submit Method
  async submitDecision() {
    // Show confirmation dialog first
    const confirmed = await this.showConfirmation(this.selectedAction!);
    if (!confirmed) return;
    
    this.isLoading = true;
    
    try {
      if (this.selectedAction === 'rejectAll') {
        await this.updatePOStatus('r_order_cancelled');
        this.showSuccessMessage('rejectAll');
        
      } else if (this.selectedAction === 'acceptConfirmed') {
        await this.updatePOWithConfirmedItems();
        this.showSuccessMessage('acceptConfirmed');
        
      } else if (this.selectedAction === 'acceptBoth') {
        await this.updatePOWithConfirmedItems();
        await this.createMakeToOrderPO();
        this.showSuccessMessage('acceptBoth');
      }
      
      // Navigate back after success
      setTimeout(() => {
        this.navigateFun();
      }, 2000);
      
    } catch (error) {
      console.error('Submission error:', error);
      this.showErrorMessage('Failed to process your request. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Update PO Status (for Cancel Order)
  private updatePOStatus(status: string): Promise<any> {
    const url = `po-retailer-to-manufacture/${this.responseData.id}`;
    const payload = { statusAll: status };
    
    return this.authService.patch(url, payload)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error updating PO status:', error);
          return throwError(() => error);
        })
      ).toPromise();
  }

  // Update PO with Confirmed Items (for Accept Available Only & Accept Both)
  private updatePOWithConfirmedItems(): Promise<any> {
    const url = `po-retailer-to-manufacture/${this.responseData.id}`;
    
    // Prepare updated set array
    const updatedSet = this.responseData.set.map((item: any) => {
      if (item.status === 'm_partial_delivery') {
        return {
          ...item,
          expectedQty: item.quantity, // Keep original quantity for record
          quantity: item.availableQuantity // Update to available quantity
        };
      }
      return item; // Keep confirmed items unchanged
    });

    const payload = {
      statusAll: 'm_order_confirmed',
      set: updatedSet
    };
    
    return this.authService.patchpimage(url, payload)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error updating PO with confirmed items:', error);
          return throwError(() => error);
        })
      ).toPromise();
  }

  // Create Make-to-Order PO (for Accept Both only)
  private createMakeToOrderPO(): Promise<any> {
    const url = `po-retailer-to-manufacture/make-to-order`;
    
    // Prepare make-to-order items
    const makeToOrderSet = this.makeToOrderItems.map(item => ({
      ...item,
      quantity: item.remainingQuantity,
      availableQuantity: 0,
      confirmed: false,
      rejected: false,
      status: 'make_to_order'
    }));

    const payload = {
      previousPoNumber: this.responseData.poNumber,
      previousPoId: this.responseData.id,
      statusAll: 'make_to_order',
      set: makeToOrderSet,
      manufacturer: this.responseData.manufacturer,
      retailer: this.responseData.retailer,
      transportDetails: this.responseData.transportDetails,
      bankDetails: this.responseData.bankDetails,
      email: this.responseData.email,
      manufacturerEmail: this.responseData.manufacturerEmail,
      discount: this.responseData.discount,
      retailerPoDate: new Date(),
      expDeliveryDate: this.responseData.partialDeliveryDate,
      partialDeliveryDate: this.responseData.partialDeliveryDate
    };
    
    return this.authService.post(url, payload)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error creating make-to-order PO:', error);
          return throwError(() => error);
        })
      ).toPromise();
  }


  // Method to get action text (optional helper)
  getSelectedActionText(): string {
    switch(this.selectedAction) {
      case 'acceptBoth': return 'Accept Both Confirmed and Make-to-Order';
      case 'acceptConfirmed': return 'Accept Only Confirmed Order';
      case 'rejectAll': return 'Reject Whole Order';
      default: return '';
    }
  }

  // Order Summary Getters
get totalConfirmedItems(): number {
  return this.confirmedItems.length;
}

get totalPendingItems(): number {
  return this.makeToOrderItems.length;
}

get expDeliveryDate(): Date | string {
  return this.purchaseOrder.expDeliveryDate || this.responseData?.expDeliveryDate || '';
}

get partialDeliveryDate(): Date | string {
  return this.purchaseOrder.partialDeliveryDate || this.responseData?.partialDeliveryDate || '';
}

// Optional: If you want to calculate amounts as well
get totalConfirmedAmount(): number {
  return this.confirmedTotals.actualGrandTotal;
}

get totalPendingAmount(): number {
  return this.makeToOrderTotals.actualGrandTotal;
}


}
