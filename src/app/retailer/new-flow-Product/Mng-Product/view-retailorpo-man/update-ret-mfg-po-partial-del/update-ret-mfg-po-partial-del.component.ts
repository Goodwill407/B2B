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

  userProfile: any;

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
    // Ensure numeric values with defaults
    const availableQuantity = Number(item.availableQuantity) || 0;
    const totalQuantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    
    // Skip items with invalid price
    if (price <= 0) {
      console.warn('Skipping item with invalid price:', item);
      return;
    }

    // Add to confirmed table if available quantity > 0
    if (availableQuantity > 0) {
      this.confirmedItems.push({
        ...item,
        quantity: availableQuantity,
        expectedQty: totalQuantity,
        availableQuantity: availableQuantity,
        price: price
      });
    }

    // Calculate remaining quantity for make-to-order
    const remainingQty = totalQuantity - availableQuantity;
    if (remainingQty > 0) {
      this.makeToOrderItems.push({
        ...item,
        remainingQuantity: remainingQty,
        price: price
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
  // Add null/undefined checks and default values
  const quantity = useRemainingQty ? 
    (Number(item.remainingQuantity) || 0) : 
    (Number(item.quantity) || 0);
  const rate = Number(item.price) || 0;
  const gstRate = Number(item.hsnGst) || 0; // Default GST rate to 0 if not provided
  
  const taxable = quantity * rate;

  let cgst = 0, sgst = 0, igst = 0;

  if (this.isIntraState) {
    cgst = (taxable * gstRate / 2) / 100;
    sgst = (taxable * gstRate / 2) / 100;
  } else {
    igst = (taxable * gstRate) / 100;
  }

  const totalWithGst = taxable + cgst + sgst + igst;
  
  return { 
    taxable: isNaN(taxable) ? 0 : taxable, 
    gstRate: isNaN(gstRate) ? 0 : gstRate, 
    cgst: isNaN(cgst) ? 0 : cgst, 
    sgst: isNaN(sgst) ? 0 : sgst, 
    igst: isNaN(igst) ? 0 : igst, 
    totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst 
  };
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
    totalQty: isNaN(totalQty) ? 0 : totalQty,
    totalTaxable: isNaN(totalTaxable) ? 0 : totalTaxable,
    totalCGST: isNaN(totalCGST) ? 0 : totalCGST,
    totalSGST: isNaN(totalSGST) ? 0 : totalSGST,
    totalIGST: isNaN(totalIGST) ? 0 : totalIGST,
    totalWithGST: isNaN(totalWithGST) ? 0 : totalWithGST,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    actualGrandTotal: isNaN(actualGrandTotal) ? 0 : actualGrandTotal
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
    totalQty: isNaN(totalQty) ? 0 : totalQty,
    totalTaxable: isNaN(totalTaxable) ? 0 : totalTaxable,
    totalCGST: isNaN(totalCGST) ? 0 : totalCGST,
    totalSGST: isNaN(totalSGST) ? 0 : totalSGST,
    totalIGST: isNaN(totalIGST) ? 0 : totalIGST,
    totalWithGST: isNaN(totalWithGST) ? 0 : totalWithGST,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    actualGrandTotal: isNaN(actualGrandTotal) ? 0 : actualGrandTotal
  };
}


  get totalGSTAmountConfirmed(): number {
  const totals = this.confirmedTotals;
  const total = totals.totalCGST + totals.totalSGST + totals.totalIGST;
  return isNaN(total) ? 0 : total;
}

get totalGSTAmountMakeToOrder(): number {
  const totals = this.makeToOrderTotals;
  const total = totals.totalCGST + totals.totalSGST + totals.totalIGST;
  return isNaN(total) ? 0 : total;
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
// Enhanced Error Messages for better user feedback
showErrorMessage(message: string) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message || 'Something went wrong. Please try again.',
    confirmButtonColor: '#007bff'
  });
}

// Main Submit Method - UPDATED with proper flow
async submitDecision() {
  const confirmed = await this.showConfirmation(this.selectedAction!);
  if (!confirmed) return;
  
  this.isLoading = true;
  
  try {
    if (this.selectedAction === 'rejectAll') {
      // Step 1: Update inventory first (ONLY CALL HERE)
      console.log('Step 1: Updating inventory...');
      await this.updateInventoryBulk();
      console.log('Inventory updated successfully');
      
      // Step 2: Only if inventory update succeeds, then cancel PO
      console.log('Step 2: Cancelling order...');
      await this.updatePOStatus('r_order_cancelled');
      console.log('Order cancelled successfully');
      
      this.showSuccessMessage('rejectAll');
      
    } else if (this.selectedAction === 'acceptConfirmed') {
      await this.updatePOWithConfirmedItems();
      this.showSuccessMessage('acceptConfirmed');
      
    } else if (this.selectedAction === 'acceptBoth') {
      await this.updatePOWithConfirmedItems();
      await this.createMakeToOrderPO();
      this.showSuccessMessage('acceptBoth');
    }
    
    setTimeout(() => {
      this.navigateFun();
    }, 2000);
    
  } catch (error) {
    console.error('Submission error:', error);
    
    // Provide specific error messages
    if (this.selectedAction === 'rejectAll') {
      this.showErrorMessage('Failed to cancel order. Inventory update or order cancellation failed.');
    } else {
      this.showErrorMessage('Failed to process your request. Please try again.');
    }
  } finally {
    this.isLoading = false;
  }
}


// Add this new method to handle inventory updates when canceling order
private async updateInventoryBulk(): Promise<any> {
  // Filter items with availableQuantity > 0
  const itemsToUpdate = this.responseData.set.filter((item: any) => 
    item.availableQuantity && Number(item.availableQuantity) > 0
  );

  if (itemsToUpdate.length === 0) {
    console.log('No items with available quantity to update inventory');
    return Promise.resolve();
  }

  // Get MFG user email 
   const manufacturerEmail = this.responseData?.manufacturer?.email;

  // Prepare payload for bulk inventory update
  const updates = itemsToUpdate.map((item: any) => ({
    designNumber: item.designNumber,
    colourName: item.colourName,
    standardSize: item.size,
    quantity: Number(item.availableQuantity),
    status: "add",
    lastUpdatedBy: "Admin", // You can make this dynamic based on current user
    userEmail: manufacturerEmail
  }));

  const payload = { updates };

  console.log('Inventory bulk update payload:', payload);

  return this.authService.post('manufacture-inventory/update-bulk', payload)
    .pipe(
      retry(2),
      catchError(error => {
        console.error('Error updating inventory bulk:', error);
        return throwError(() => error);
      })
    ).toPromise();
}

  // Update PO Status (for Cancel Order)
// Update PO Status - SIMPLIFIED (no inventory logic here)
private updatePOStatus(status: string): Promise<any> {
  const url = `po-retailer-to-manufacture/${this.responseData.id}`;
  const payload = { statusAll: status };
  
  return this.authService.patchpimage(url, payload)
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
  const amount = this.confirmedTotals.actualGrandTotal;
  return isNaN(amount) ? 0 : amount;
}

get totalPendingAmount(): number {
  const amount = this.makeToOrderTotals.actualGrandTotal;
  return isNaN(amount) ? 0 : amount;
}



}
