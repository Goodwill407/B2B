// update-ret-mfg-po-partial-new.component.ts
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
  selector: 'app-update-ret-mfg-po-partial-new',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    IndianCurrencyPipe, AmountInWordsPipe
  ],
  templateUrl: './update-ret-mfg-po-partial-new.component.html',
  styleUrl: './update-ret-mfg-po-partial-new.component.scss'
})
export class UpdateRetMfgPoPartialNewComponent implements OnInit {
  responseData: any;
  purchaseOrder: any = {};
  confirmedItems: any[] = [];            // Table 1: designs with NO partial rows
  makeToOrderItems: any[] = [];          // Table 2: designs where ANY row is partial

  // Temp/grouping helpers
  groupedConfirmedTemp: any[][] = [];    // Array of arrays, grouped by design
  groupedPartialTemp: any[][] = [];      // Array of arrays, grouped by design

  // Future actions
  removedFromPartial: any[] = [];        // For rows removed from table 2
  finalRemaining: any[] = [];            // Built during Generate action (1 + 2 after removals)

  // UI Properties
  isLoading: boolean = false;
  isIntraState: boolean = false;
  bankDetails: any;

  manufacturerNote: string = '';
  userProfile: any;

  // Optional previous actions (reused for confirmations)
  selectedAction: string | null = null;

  // NEW/UPDATED pieces only – keep the rest of your component as-is

// Optional: toggle if you want to gate the confirm CTA
previewMode = true; // set true after data load if you want explicit preview step

// Add these new fields near other UI properties
showPreview: boolean = false;
previewConfirmedItems: any[] = [];
previewMakeToOrderItems: any[] = [];

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
        this.separateItems(res.set);   // regroup by design -> split 1st/2nd tables
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

    if (res.bankDetails) {
      this.bankDetails = res.bankDetails;
    }
  }

  // Group by designNumber, then split:
  // - If ANY row in a design is 'm_partial_delivery' => whole design goes to table 2 (makeToOrderItems)
  // - Otherwise entire design goes to table 1 (confirmedItems)
// Replace your existing separateItems(...) with this version
separateItems(items: any[]) {
  this.confirmedItems = [];
  this.makeToOrderItems = [];
  this.groupedConfirmedTemp = [];
  this.groupedPartialTemp = [];

  // Build map by composite key: designNumber + colourName (fallback to colour)
  const groupMap = new Map<string, any[]>();

  for (const raw of items || []) {
    // Normalize numeric fields
    const quantity = Number(raw.quantity) || 0;
    const availableQuantity = Number(raw.availableQuantity) || 0;
    const price = Number(raw.price) || 0;
    if (price <= 0) continue; // Skip items with invalid price

    // Normalize key parts
    const design = String(raw.designNumber || '').trim().toLowerCase();
    // Prefer colourName; fallback to hex colour; default to 'na'
    const colorNorm = String(raw.colourName || raw.colour || 'na').trim().toLowerCase();

    const normalized = {
      ...raw,
      quantity,             // ordered qty
      availableQuantity,    // available for dispatch
      price                 // numeric
    };

    const key = `${design}||${colorNorm}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(normalized);
  }

  // Sorting helper for "Design -> Color -> Size"
  const sorter = (a: any, b: any) => {
    const d = String(a.designNumber || '').localeCompare(String(b.designNumber || ''));
    if (d !== 0) return d;
    const c = String(a.colourName || '').localeCompare(String(b.colourName || ''));
    if (c !== 0) return c;
    return String(a.size || '').localeCompare(String(b.size || ''));
  };

  const confirmedFlat: any[] = [];
  const partialFlat: any[] = [];
  const confirmedGroupArr: any[][] = [];
  const partialGroupArr: any[][] = [];

  // Split by presence of any partial row within the same design+color group
  for (const [, group] of groupMap.entries()) {
    const sortedGroup = [...group].sort(sorter);
    const hasPartial = sortedGroup.some(x => x.status === 'm_partial_delivery');

    if (hasPartial) {
      // Entire design+color group goes to Partial table
      const prepared = sortedGroup.map(item => {
        const remainingQuantity = Math.max(
          (Number(item.quantity) || 0) - (Number(item.availableQuantity) || 0),
          0
        );
        return {
          ...item,
          expectedQty: Number(item.quantity) || 0,
          quantity: Number(item.availableQuantity) || 0, // dispatch qty now
          remainingQuantity                              // used by getGstAmounts(..., true)
        };
      });
      partialGroupArr.push(prepared);
      partialFlat.push(...prepared);
    } else {
      // Entire design+color group goes to Confirmed table
      const prepared = sortedGroup.map(item => ({
        ...item,
        expectedQty: Number(item.quantity) || 0,
        quantity: Number(item.availableQuantity) || 0 // dispatch qty now
      }));
      confirmedGroupArr.push(prepared);
      confirmedFlat.push(...prepared);
    }
  }

  this.groupedConfirmedTemp = confirmedGroupArr;
  this.groupedPartialTemp = partialGroupArr;

  this.confirmedItems = confirmedFlat;
  this.makeToOrderItems = partialFlat;
}


  updateStateType() {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = !!buyerState && !!supplierState && (buyerState === supplierState);
  }

  // GST Calculation Methods (unchanged api, honors isIntraState)
  getGstAmounts(item: any, useRemainingQty: boolean = false) {
  const quantity = useRemainingQty ?
    (Number(item.remainingQuantity) || 0) :
    (Number(item.quantity) || 0);
  const rate = Number(item.price) || 0;
  const gstRate = Number(item.hsnGst) || 0;

  // ✅ Apply discount to rate BEFORE calculating taxable value
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  const discountedRate = rate - (rate * discountPercent / 100);

  const taxable = quantity * discountedRate; // Use discounted rate

  let cgst = 0, sgst = 0, igst = 0;
  if (this.isIntraState) {
    cgst = (taxable * gstRate / 2) / 100;
    sgst = (taxable * gstRate / 2) / 100;
  } else {
    igst = (taxable * gstRate) / 100;
  }

  const totalWithGst = taxable + cgst + sgst + igst;

  return {
    originalRate: rate,
    discountedRate: discountedRate,
    taxable: isNaN(taxable) ? 0 : taxable,
    gstRate: isNaN(gstRate) ? 0 : gstRate,
    cgst: isNaN(cgst) ? 0 : cgst,
    sgst: isNaN(sgst) ? 0 : sgst,
    igst: isNaN(igst) ? 0 : igst,
    totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst
  };
}


  // Table Totals (unchanged)
  get confirmedTotals() {
  let totalQty = 0, totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalWithGST = 0;

  for (const item of this.confirmedItems) {
    const gst = this.getGstAmounts(item);
    totalQty += Number(item.quantity) || 0;
    totalTaxable += gst.taxable || 0;
    totalCGST += gst.cgst || 0;
    totalSGST += gst.sgst || 0;
    totalIGST += gst.igst || 0;
    totalWithGST += gst.totalWithGst || 0;
  }

  // ✅ Calculate discount from original rates (before discount)
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  let totalWithoutDiscount = 0;
  for (const item of this.confirmedItems) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    totalWithoutDiscount += quantity * rate;
  }
  const discountAmount = (totalWithoutDiscount * discountPercent) / 100;

  return {
    totalQty: isNaN(totalQty) ? 0 : totalQty,
    totalTaxable: isNaN(totalTaxable) ? 0 : totalTaxable,
    totalCGST: isNaN(totalCGST) ? 0 : totalCGST,
    totalSGST: isNaN(totalSGST) ? 0 : totalSGST,
    totalIGST: isNaN(totalIGST) ? 0 : totalIGST,
    totalWithGST: isNaN(totalWithGST) ? 0 : totalWithGST,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    actualGrandTotal: isNaN(totalWithGST) ? 0 : totalWithGST // Discount already applied at line level
  };
}

  get makeToOrderTotals() {
  let totalQty = 0, totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalWithGST = 0;

  for (const item of this.makeToOrderItems) {
    const gst = this.getGstAmounts(item, true); // use remaining
    totalQty += Number(item.remainingQuantity) || 0;
    totalTaxable += gst.taxable || 0;
    totalCGST += gst.cgst || 0;
    totalSGST += gst.sgst || 0;
    totalIGST += gst.igst || 0;
    totalWithGST += gst.totalWithGst || 0;
  }

  // ✅ Calculate discount from original rates
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  let totalWithoutDiscount = 0;
  for (const item of this.makeToOrderItems) {
    const quantity = Number(item.remainingQuantity) || 0;
    const rate = Number(item.price) || 0;
    totalWithoutDiscount += quantity * rate;
  }
  const discountAmount = (totalWithoutDiscount * discountPercent) / 100;

  return {
    totalQty: isNaN(totalQty) ? 0 : totalQty,
    totalTaxable: isNaN(totalTaxable) ? 0 : totalTaxable,
    totalCGST: isNaN(totalCGST) ? 0 : totalCGST,
    totalSGST: isNaN(totalSGST) ? 0 : totalSGST,
    totalIGST: isNaN(totalIGST) ? 0 : totalIGST,
    totalWithGST: isNaN(totalWithGST) ? 0 : totalWithGST,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    actualGrandTotal: isNaN(totalWithGST) ? 0 : totalWithGST
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

  // Removal with confirmation from table 2
async confirmRemoveFromMakeToOrder(index: number) {
  const item = this.makeToOrderItems[index];
  
  // Check if required and dispatch quantities match
  const requiredQty = Number(item.expectedQty) || 0;
  const dispatchQty = Number(item.quantity) || 0;
  const remainingQty = Number(item.remainingQuantity) || 0;
  
  if (requiredQty === dispatchQty) {
    // Simple removal: no partial quantities
    const result = await Swal.fire({
      title: 'Remove this item?',
      text: 'It will be excluded from both POs and processed as cancelled on confirm.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    const removed = this.makeToOrderItems.splice(index, 1)[0];
    if (removed) {
      this.removedFromPartial.push(removed);
      this.communicationService.customSuccess('Item queued for cancel and inventory update');
    }
  } else {
    // Partial quantities exist: show two-option dialog
    const result = await Swal.fire({
      title: 'Choose Removal Option',
      html: `
        <div style="text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 15px;">
            <strong>Design:</strong> ${item.designNumber} | 
            <strong>Color:</strong> ${item.colourName} | 
            <strong>Size:</strong> ${item.size}
          </p>
          <p style="margin-bottom: 10px;">
            <strong>Required Qty:</strong> ${requiredQty} | 
            <strong>Dispatch Qty:</strong> ${dispatchQty} | 
            <strong>Remaining Qty:</strong> ${remainingQty}
          </p>
        </div>
        <div style="border-top: 1px solid #ddd; padding-top: 15px;">
          <p style="font-weight: 600; margin-bottom: 10px;">What would you like to remove?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: `Remove entire set (${requiredQty} pcs)`,
      denyButtonText: `Remove only make-to-order qty (${remainingQty} pcs)`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      denyButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      reverseButtons: false
    });
    
    if (result.isConfirmed) {
      // Option 1: Remove entire row (all quantities)
      const removed = this.makeToOrderItems.splice(index, 1)[0];
      if (removed) {
        this.removedFromPartial.push({
          ...removed,
          removalType: 'full' // mark for complete cancellation
        });
        this.communicationService.customSuccess(
          `Entire set removed: ${item.designNumber} - ${item.colourName} - ${item.size} (${requiredQty} pcs)`
        );
      }
    } else if (result.isDenied) {
      // Option 2: Remove only make-to-order qty, keep dispatch qty in confirmed
      const removed = this.makeToOrderItems.splice(index, 1)[0];
      if (removed) {
        // Add to confirmed items with dispatch qty only
        this.confirmedItems.push({
          ...removed,
          quantity: dispatchQty,           // set to dispatch qty
          expectedQty: dispatchQty,        // expected = dispatch for confirmed
          remainingQuantity: 0,            // no remaining qty
          status: 'm_confirmed'            // mark as confirmed
        });
        
        // Track only the remaining qty for cancellation
        this.removedFromPartial.push({
          ...removed,
          quantity: 0,                     // no dispatch qty to cancel
          remainingQuantity: remainingQty, // only remaining qty cancelled
          removalType: 'partial'           // mark as partial removal
        });
        
        this.communicationService.customSuccess(
          `Make-to-order qty removed and dispatch qty moved to confirmed: ${item.designNumber} - ${item.colourName} - ${item.size}`
        );
      }
    }
    // If cancelled, do nothing
  }
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

  // SweetAlert2 Confirmation Dialog (reuse)
  async showConfirmation(action: string): Promise<boolean> {
    let title = '';
    let text = '';

    switch (action) {
      case 'acceptBoth':
        title = 'Generate New PO?';
        text = 'This will update the current PO with available items and create a new Make-to-Order PO for remaining items.';
        break;
      case 'rejectAll':
        title = 'Cancel Entire Order?';
        text = 'This will cancel the complete purchase order .';
        break;
    }

    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d'
    });

    return result.isConfirmed;
  }

  // Button: Generate New PO (Accept Both flow)
  async onGenerateNewPo() {
    const ok = await this.showConfirmation('acceptBoth');
    if (!ok) return;

    this.isLoading = true;
    try {
      // Build finalRemaining snapshot for downstream usage
      this.finalRemaining = [...this.confirmedItems, ...this.makeToOrderItems];

      // Update current PO with dispatchable quantities
      await this.updatePOWithConfirmedItems();

      // Create make-to-order PO only for items with remainingQuantity > 0
      await this.createMakeToOrderPO();

      this.showSuccessMessage('acceptBoth');

      setTimeout(() => this.navigateFun(), 2000);
    } catch (err) {
      console.error('Generate New PO error:', err);
      this.showErrorMessage('Failed to generate new PO. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  // Button: Cancel Order (same logic as Cancel Entire Order)
  async onCancelOrder() {
    const ok = await this.showConfirmation('rejectAll');
    if (!ok) return;

    this.isLoading = true;
    try {
      await this.updateInventoryBulk();
      await this.updatePOStatus('r_order_cancelled');
      this.showSuccessMessage('rejectAll');
      setTimeout(() => this.navigateFun(), 2000);
    } catch (err) {
      console.error('Cancel Order error:', err);
      this.showErrorMessage('Failed to cancel order. Inventory update or order cancellation failed.');
    } finally {
      this.isLoading = false;
    }
  }

  // Success / Error messages
  showSuccessMessage(action: string) {
    let message = '';
    switch (action) {
      case 'acceptBoth':
        message = 'Order Updated and New Make to Order created';
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

  showErrorMessage(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message || 'Something went wrong. Please try again.',
      confirmButtonColor: '#007bff'
    });
  }

  // Inventory bulk update (used in cancel flow)
  private async updateInventoryBulk(): Promise<any> {
    const itemsToUpdate = (this.responseData?.set || []).filter((item: any) =>
      item.availableQuantity && Number(item.availableQuantity) > 0
    );

    if (itemsToUpdate.length === 0) {
      return Promise.resolve();
    }

    const manufacturerEmail = this.responseData?.manufacturer?.email;

    const updates = itemsToUpdate.map((item: any) => ({
      designNumber: item.designNumber,
      colourName: item.colourName,
      standardSize: item.size,
      quantity: Number(item.availableQuantity),
      status: 'add',
      lastUpdatedBy: 'Admin',
      userEmail: manufacturerEmail
    }));

    const payload = { updates };

    return this.authService.post('manufacture-inventory/update-bulk', payload)
      .pipe(
        retry(2),
        catchError(error => {
          console.error('Error updating inventory bulk:', error);
          return throwError(() => error);
        })
      ).toPromise();
  }

  // Update PO status
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

  // Update PO with dispatchable quantities for current order
  private updatePOWithConfirmedItems(): Promise<any> {
    const url = `po-retailer-to-manufacture/${this.responseData.id}`;

    // For current PO: set quantity to availableQuantity for ALL rows, and keep expectedQty as original
    const updatedSet = (this.responseData?.set || []).map((item: any) => ({
      ...item,
      expectedQty: Number(item.quantity) || 0,
      quantity: Number(item.availableQuantity) || 0
    }));

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

  // Create Make-to-Order PO for residuals only
  private createMakeToOrderPO(): Promise<any> {
    const url = `po-retailer-to-manufacture/make-to-order`;

    // Use current makeToOrderItems state and include only rows with remaining > 0
    const makeToOrderSet = (this.makeToOrderItems || [])
      .filter(x => (Number(x.remainingQuantity) || 0) > 0)
      .map(item => ({
        ...item,
        quantity: Number(item.remainingQuantity) || 0,
        availableQuantity: 0,
        confirmed: false,
        rejected: false,
        status: 'make_to_order'
      }));

    if (makeToOrderSet.length === 0) {
      // Nothing to create
      return Promise.resolve();
    }

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

  // Order Summary Getters
  get totalConfirmedItems(): number {
  return (this.responseData?.set || []).filter(
      (item:any) => item.status === 'm_confirmed'
    ).length;
  }

  get totalPartialItems(): number {
    return (this.responseData?.set || []).filter(
      (item:any) => item.status === 'm_partial_delivery'
    ).length;
  }

  get expDeliveryDate(): Date | string {
    return this.purchaseOrder.expDeliveryDate || this.responseData?.expDeliveryDate || '';
  }

  get partialDeliveryDate(): Date | string {
    return this.purchaseOrder.partialDeliveryDate || this.responseData?.partialDeliveryDate || '';
  }

  get totalConfirmedAmount(): number {
    const amount = this.confirmedTotals.actualGrandTotal;
    return isNaN(amount) ? 0 : amount;
  }

  get totalPendingAmount(): number {
    const amount = this.makeToOrderTotals.actualGrandTotal;
    return isNaN(amount) ? 0 : amount;
  }

// Optional separate totals for preview so existing tables remain untouched
get confirmedPreviewTotals() {
  let totalQty = 0, totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalWithGST = 0;
  
  for (const item of this.previewConfirmedItems) {
    const gst = this.getGstAmounts(item);
    totalQty += Number(item.quantity) || 0;
    totalTaxable += gst.taxable || 0;
    totalCGST += gst.cgst || 0;
    totalSGST += gst.sgst || 0;
    totalIGST += gst.igst || 0;
    totalWithGST += gst.totalWithGst || 0;
  }
  
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  let totalWithoutDiscount = 0;
  for (const item of this.previewConfirmedItems) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    totalWithoutDiscount += quantity * rate;
  }
  const discountAmount = (totalWithoutDiscount * discountPercent) / 100;
  
  return { 
    totalQty, 
    totalTaxable, 
    totalCGST, 
    totalSGST, 
    totalIGST, 
    totalWithGST, 
    discountAmount, 
    actualGrandTotal: totalWithGST 
  };
}

get makeToOrderPreviewTotals() {
  let totalQty = 0, totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalWithGST = 0;
  
  for (const item of this.previewMakeToOrderItems) {
    const gst = this.getGstAmounts(item, true);
    totalQty += Number(item.remainingQuantity) || 0;
    totalTaxable += gst.taxable || 0;
    totalCGST += gst.cgst || 0;
    totalSGST += gst.sgst || 0;
    totalIGST += gst.igst || 0;
    totalWithGST += gst.totalWithGst || 0;
  }
  
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  let totalWithoutDiscount = 0;
  for (const item of this.previewMakeToOrderItems) {
    const quantity = Number(item.remainingQuantity) || 0;
    const rate = Number(item.price) || 0;
    totalWithoutDiscount += quantity * rate;
  }
  const discountAmount = (totalWithoutDiscount * discountPercent) / 100;
  
  return { 
    totalQty, 
    totalTaxable, 
    totalCGST, 
    totalSGST, 
    totalIGST, 
    totalWithGST, 
    discountAmount, 
    actualGrandTotal: totalWithGST 
  };
}

get totalGSTAmountConfirmedPreview(): number {
  const t = this.confirmedPreviewTotals;
  return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
}

get totalGSTAmountMakeToOrderPreview(): number {
  const t = this.makeToOrderPreviewTotals;
  return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
}

// Build preview arrays and open overlay
openPreview() {
  const removedIds = new Set((this.removedFromPartial || []).map((x: any) => x._id));

  // Confirmed PO preview:
  // - include all current confirmedItems as-is
  // - include non-removed rows from makeToOrderItems with their available (quantity already set)
  const confirmedFromPartial = (this.makeToOrderItems || [])
    .filter(x => !removedIds.has(x._id))
    .map(x => ({
      ...x,
      // ensure dispatch quantity is the available part
      quantity: Number(x.availableQuantity ?? x.quantity) || 0,
      expectedQty: Number(x.expectedQty ?? x.quantity) || 0
    }));

  this.previewConfirmedItems = [
    ...(this.confirmedItems || []),
    ...confirmedFromPartial
  ];

  // Make-to-Order PO preview: only non-removed rows with remainingQuantity > 0
  this.previewMakeToOrderItems = (this.makeToOrderItems || [])
    .filter(x => !removedIds.has(x._id))
    .filter(x => (Number(x.remainingQuantity) || 0) > 0);

  this.showPreview = true;
}

// Allow closing preview without submitting
closePreview() {
  this.showPreview = false;
}

// Entry point: show confirmation then open preview
async onConfirmAndUpdatePOs() {
  const ok = await this.showConfirmation('acceptBoth');
  if (!ok) return;
  this.openPreview();
}

// Final submission after preview confirmation
async finalizeConfirmAndUpdatePOs() {
  this.isLoading = true;
  try {
    // Snapshot for audit if needed
    this.finalRemaining = [...this.previewConfirmedItems, ...this.previewMakeToOrderItems];

    // 1. Update current PO excluding removed items
    await this.updatePOExcludingRemoved();

    // 2. Create Make-to-Order PO for remaining items only
    await this.createMakeToOrderPOExcludingRemoved();

    // 3. Return cancelled available quantities back to inventory
    await this.updateInventoryForRemoved();

    this.showSuccessMessage('acceptBoth');
    setTimeout(() => this.navigateFun(), 2000);
  } catch (e) {
    console.error('Confirm & Update error:', e);
    this.showErrorMessage('Failed to confirm updates. Please try again.');
  } finally {
    this.isLoading = false;
    this.showPreview = false;
  }
}

// Update current PO: handle full/partial removals
private updatePOExcludingRemoved(): Promise<any> {
  const url = `po-retailer-to-manufacture/${this.responseData.id}`;

  const removedMap = new Map((this.removedFromPartial || []).map((x: any) => [x._id, x]));
  const originalSet: any[] = this.responseData?.set || [];

  // Build updated set:
  // - Non-removed: expectedQty = original ordered qty, quantity = availableQuantity
  // - Removed (full): quantity = 0, status = 'r_cancelled'
  // - Removed (partial): quantity = availableQuantity, status = 'm_confirmed' (dispatch qty kept)
  const updatedSet = originalSet.map((item: any) => {
    const expectedQty = Number(item.quantity) || 0;
    const available = Number(item.availableQuantity) || 0;
    const removed = removedMap.get(item._id);

    if (removed) {
      if (removed.removalType === 'full') {
        // Full removal: cancel entire row
        return {
          ...item,
          expectedQty,
          quantity: 0,
          availableQuantity: 0,
          status: 'r_cancelled'
        };
      } else if (removed.removalType === 'partial') {
        // Partial removal: keep dispatch qty, cancel remaining only
        return {
          ...item,
          expectedQty: available, // update expected to match dispatch
          quantity: available,
          availableQuantity: available,
          status: 'm_confirmed'
        };
      }
    }

    // Not removed: standard flow
    return {
      ...item,
      expectedQty,
      quantity: available,
      status: 'm_confirmed'
    };
  });

  const payload = {
    statusAll: 'm_order_confirmed',
    set: updatedSet
  };

  return this.authService.patchpimage(url, payload)
    .pipe(
      retry(2),
      catchError(error => {
        console.error('Error updating PO excluding removed:', error);
        return throwError(() => error);
      })
    ).toPromise();
}

// Create Make-to-Order: only rows with remainingQuantity > 0 and NOT fully removed
private createMakeToOrderPOExcludingRemoved(): Promise<any> {
  const url = `po-retailer-to-manufacture/make-to-order`;

  const removedFullIds = new Set(
    (this.removedFromPartial || [])
      .filter((x: any) => x.removalType === 'full')
      .map((x: any) => x._id)
  );

  const makeToOrderSet = (this.makeToOrderItems || [])
    .filter(item => !removedFullIds.has(item._id)) // exclude fully removed
    .filter(item => (Number(item.remainingQuantity) || 0) > 0)
    .map(item => ({
      ...item,
      quantity: Number(item.remainingQuantity) || 0,
      availableQuantity: 0,
      confirmed: false,
      rejected: false,
      status: 'make_to_order'
    }));

  if (makeToOrderSet.length === 0) {
    return Promise.resolve();
  }

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
        console.error('Error creating MTO excluding removed:', error);
        return throwError(() => error);
      })
    ).toPromise();
}

// Inventory update for removed items: add back availableQuantity to manufacturer inventory
private updateInventoryForRemoved(): Promise<any> {
  const removed = this.removedFromPartial || [];
  
  // For full removal: add back availableQuantity
  // For partial removal: NO inventory add (dispatch qty stays in confirmed PO)
  const itemsToAdd = removed.filter((x: any) => {
    if (x.removalType === 'full') {
      return Number(x.availableQuantity) > 0;
    }
    return false; // partial removals don't return inventory
  });

  if (itemsToAdd.length === 0) {
    return Promise.resolve();
  }

  const manufacturerEmail = this.responseData?.manufacturer?.email;
  const updates = itemsToAdd.map((item: any) => ({
    designNumber: item.designNumber,
    colourName: item.colourName,
    standardSize: item.size,
    quantity: Number(item.availableQuantity),
    status: 'add',
    lastUpdatedBy: 'Admin',
    userEmail: manufacturerEmail
  }));

  const payload = { updates };
  return this.authService.post('manufacture-inventory/update-bulk', payload)
    .pipe(
      retry(2),
      catchError(error => {
        console.error('Error updating inventory for removed:', error);
        return throwError(() => error);
      })
    ).toPromise();
}


}
