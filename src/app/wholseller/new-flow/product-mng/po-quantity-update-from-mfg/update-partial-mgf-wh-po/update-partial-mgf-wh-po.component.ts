import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import Swal from 'sweetalert2';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-update-partial-mgf-wh-po',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    IndianCurrencyPipe, AmountInWordsPipe
  ],
  templateUrl: './update-partial-mgf-wh-po.component.html',
  styleUrl: './update-partial-mgf-wh-po.component.scss'
})
export class UpdatePartialMgfWhPoComponent implements OnInit {

  responseData: any;
  purchaseOrder: any = {};

  confirmedItems: any[] = [];       // Table 1: designs with NO partial rows
  makeToOrderItems: any[] = [];     // Table 2: designs where ANY row is partial

  groupedConfirmedTemp: any[][] = [];
  groupedPartialTemp: any[][] = [];

  removedFromPartial: any[] = [];
  finalRemaining: any[] = [];

  isLoading: boolean = false;
  isIntraState: boolean = false;
  bankDetails: any;

  manufacturerNote: string = '';
  userProfile: any;

  selectedAction: string | null = null;
  previewMode = true;

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

  // ── Data Loading ────────────────────────────────────────────────────────────

  loadPOData(poId: string): void {
    this.isLoading = true;
    this.authService.get(`po-wholesaler-to-manufacture/${poId}`).subscribe({
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

  setupPOData(res: any): void {
    this.purchaseOrder = {
      // ── Supplier = Manufacturer ────────────────────────────────────────────
      supplierName:    res.manufacturer?.companyName || '',
      supplierAddress: `${res.manufacturer?.address}, ${res.manufacturer?.pinCode} - ${res.manufacturer?.state}`,
      supplierContact: res.manufacturer?.mobNumber || '',
      supplierGSTIN:   res.manufacturer?.GSTIN || '',
      supplierEmail:   res.manufacturer?.email || '',
      supplierPAN:     this.extractPanFromGstin(res.manufacturer?.GSTIN) || '',

      // ── Buyer = Wholesaler ─────────────────────────────────────────────────
      buyerName:    res.wholesaler?.companyName || '',
      buyerAddress: `${res.wholesaler?.address}, ${res.wholesaler?.pinCode} - ${res.wholesaler?.state}`,
      buyerPhone:   res.wholesaler?.mobNumber || '',
      buyerEmail:   res.wholesaler?.email || '',
      buyerGSTIN:   res.wholesaler?.GSTIN || '',
      buyerPAN:     this.extractPanFromGstin(res.wholesaler?.GSTIN) || '',

      // ── PO Meta ────────────────────────────────────────────────────────────
      logoUrl:      res.wholesaler?.profileImg || res.wholesaler?.logo || '',
      poDate:       new Date(res.wholesalerPODateCreated).toLocaleDateString(),
      orderNumber:  res.poNumber,

      ProductDiscount:    parseFloat(res.discount || res.wholesaler?.productDiscount || 0),
      transportDetails:   res.transportDetails || null,
      expDeliveryDate:    res.expDeliveryDate || '',
      partialDeliveryDate: res.partialDeliveryDate || '',
    };

    this.manufacturerNote = res.manufacturerNote || '';

    const bankData = res.bankDetails || res.manufacturer?.bankDetails;
    if (bankData) {
      this.bankDetails = bankData;
    }
  }

  // ── Item Separation (same logic as ref, wholesaler-aware) ──────────────────

  separateItems(items: any[]): void {
    this.confirmedItems = [];
    this.makeToOrderItems = [];
    this.groupedConfirmedTemp = [];
    this.groupedPartialTemp = [];

    const groupMap = new Map<string, any[]>();

    for (const raw of items || []) {
      const quantity         = Number(raw.quantity)         || 0;
      const availableQuantity = Number(raw.availableQuantity) || 0;
      const price            = Number(raw.price)            || 0;
      if (price <= 0) continue;

      const design    = String(raw.designNumber || '').trim().toLowerCase();
      const colorNorm = String(raw.colourName || raw.colour || 'na').trim().toLowerCase();

      const normalized = { ...raw, quantity, availableQuantity, price };
      const key = `${design}||${colorNorm}`;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push(normalized);
    }

    const sorter = (a: any, b: any) => {
      const d = String(a.designNumber || '').localeCompare(String(b.designNumber || ''));
      if (d !== 0) return d;
      const c = String(a.colourName || '').localeCompare(String(b.colourName || ''));
      if (c !== 0) return c;
      return String(a.size || '').localeCompare(String(b.size || ''));
    };

    const confirmedFlat: any[]    = [];
    const partialFlat: any[]      = [];
    const confirmedGroupArr: any[][] = [];
    const partialGroupArr: any[][]   = [];

    for (const [, group] of groupMap.entries()) {
      const sortedGroup = [...group].sort(sorter);
      const hasPartial  = sortedGroup.some(x => x.status === 'm_partial_delivery');

      if (hasPartial) {
        const prepared = sortedGroup.map(item => {
          const remainingQuantity = Math.max(
            (Number(item.quantity) || 0) - (Number(item.availableQuantity) || 0), 0
          );
          return {
            ...item,
            expectedQty:        Number(item.quantity)          || 0,
            quantity:           Number(item.availableQuantity) || 0,
            remainingQuantity
          };
        });
        partialGroupArr.push(prepared);
        partialFlat.push(...prepared);
      } else {
        const prepared = sortedGroup.map(item => ({
          ...item,
          expectedQty: Number(item.quantity)          || 0,
          quantity:    Number(item.availableQuantity) || 0
        }));
        confirmedGroupArr.push(prepared);
        confirmedFlat.push(...prepared);
      }
    }

    this.groupedConfirmedTemp = confirmedGroupArr;
    this.groupedPartialTemp   = partialGroupArr;
    this.confirmedItems       = confirmedFlat;
    this.makeToOrderItems     = partialFlat;
  }

  // ── State / GST ─────────────────────────────────────────────────────────────

  updateStateType(): void {
    const buyerState    = this.responseData?.wholesaler?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState   = !!buyerState && !!supplierState && (buyerState === supplierState);
  }

  get colspan(): number {
    return this.isIntraState ? 16 : 15;
  }

  getGstAmounts(item: any, useRemainingQty: boolean = false) {
    const quantity        = useRemainingQty
      ? (Number(item.remainingQuantity) || 0)
      : (Number(item.quantity)          || 0);
    const rate            = Number(item.price)   || 0;
    const gstRate         = Number(item.hsnGst)  || 0;
    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountedRate  = rate - (rate * discountPercent / 100);
    const taxable         = quantity * discountedRate;

    let cgst = 0, sgst = 0, igst = 0;
    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }

    const totalWithGst = taxable + cgst + sgst + igst;

    return {
      originalRate:   rate,
      discountedRate,
      taxable:        isNaN(taxable)      ? 0 : taxable,
      gstRate:        isNaN(gstRate)      ? 0 : gstRate,
      cgst:           isNaN(cgst)         ? 0 : cgst,
      sgst:           isNaN(sgst)         ? 0 : sgst,
      igst:           isNaN(igst)         ? 0 : igst,
      totalWithGst:   isNaN(totalWithGst) ? 0 : totalWithGst,
    };
  }

  // ── Table Totals ────────────────────────────────────────────────────────────

  private calcTotals(items: any[], useRemaining = false) {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0,
        totalSGST = 0, totalIGST = 0, totalWithGST = 0;

    for (const item of items) {
      const gst = this.getGstAmounts(item, useRemaining);
      totalQty     += useRemaining ? (Number(item.remainingQuantity) || 0) : (Number(item.quantity) || 0);
      totalTaxable += gst.taxable      || 0;
      totalCGST    += gst.cgst         || 0;
      totalSGST    += gst.sgst         || 0;
      totalIGST    += gst.igst         || 0;
      totalWithGST += gst.totalWithGst || 0;
    }

    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    let totalWithoutDiscount = 0;
    for (const item of items) {
      const qty  = useRemaining ? (Number(item.remainingQuantity) || 0) : (Number(item.quantity) || 0);
      const rate = Number(item.price) || 0;
      totalWithoutDiscount += qty * rate;
    }
    const discountAmount = (totalWithoutDiscount * discountPercent) / 100;

    return {
      totalQty:        isNaN(totalQty)      ? 0 : totalQty,
      totalTaxable:    isNaN(totalTaxable)  ? 0 : totalTaxable,
      totalCGST:       isNaN(totalCGST)     ? 0 : totalCGST,
      totalSGST:       isNaN(totalSGST)     ? 0 : totalSGST,
      totalIGST:       isNaN(totalIGST)     ? 0 : totalIGST,
      totalWithGST:    isNaN(totalWithGST)  ? 0 : totalWithGST,
      discountAmount:  isNaN(discountAmount) ? 0 : discountAmount,
      actualGrandTotal: isNaN(totalWithGST) ? 0 : totalWithGST,
    };
  }

  get confirmedTotals()           { return this.calcTotals(this.confirmedItems,         false); }
  get makeToOrderTotals()         { return this.calcTotals(this.makeToOrderItems,        true);  }
  get confirmedPreviewTotals()    { return this.calcTotals(this.previewConfirmedItems,   false); }
  get makeToOrderPreviewTotals()  { return this.calcTotals(this.previewMakeToOrderItems, true);  }

  get totalGSTAmountConfirmed(): number {
    const t = this.confirmedTotals;
    return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
  }

  get totalGSTAmountMakeToOrder(): number {
    const t = this.makeToOrderTotals;
    return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
  }

  get totalGSTAmountConfirmedPreview(): number {
    const t = this.confirmedPreviewTotals;
    return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
  }

  get totalGSTAmountMakeToOrderPreview(): number {
    const t = this.makeToOrderPreviewTotals;
    return (t.totalCGST + t.totalSGST + t.totalIGST) || 0;
  }

  // ── Order Summary Getters ───────────────────────────────────────────────────

  get totalConfirmedItems(): number {
    return (this.responseData?.set || []).filter((i: any) => i.status === 'm_confirmed').length;
  }

  get totalPartialItems(): number {
    return (this.responseData?.set || []).filter((i: any) => i.status === 'm_partial_delivery').length;
  }

  get expDeliveryDate(): Date | string {
    return this.purchaseOrder.expDeliveryDate || this.responseData?.expDeliveryDate || '';
  }

  get partialDeliveryDate(): Date | string {
    return this.purchaseOrder.partialDeliveryDate || this.responseData?.partialDeliveryDate || '';
  }

  get totalConfirmedAmount(): number {
    return isNaN(this.confirmedTotals.actualGrandTotal) ? 0 : this.confirmedTotals.actualGrandTotal;
  }

  get totalPendingAmount(): number {
    return isNaN(this.makeToOrderTotals.actualGrandTotal) ? 0 : this.makeToOrderTotals.actualGrandTotal;
  }

  // ── Remove from Make-To-Order ───────────────────────────────────────────────

  async confirmRemoveFromMakeToOrder(index: number): Promise<void> {
    const item        = this.makeToOrderItems[index];
    const requiredQty = Number(item.expectedQty)        || 0;
    const dispatchQty = Number(item.quantity)           || 0;
    const remainingQty = Number(item.remainingQuantity) || 0;

    if (requiredQty === dispatchQty) {
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
      const result = await Swal.fire({
        title: 'Choose Removal Option',
        html: `
          <div style="text-align:left;margin-bottom:20px;">
            <p style="margin-bottom:15px;">
              <strong>Design:</strong> ${item.designNumber} |
              <strong>Color:</strong> ${item.colourName} |
              <strong>Size:</strong> ${item.size}
            </p>
            <p style="margin-bottom:10px;">
              <strong>Required Qty:</strong> ${requiredQty} |
              <strong>Dispatch Qty:</strong> ${dispatchQty} |
              <strong>Remaining Qty:</strong> ${remainingQty}
            </p>
          </div>
          <div style="border-top:1px solid #ddd;padding-top:15px;">
            <p style="font-weight:600;margin-bottom:10px;">What would you like to remove?</p>
          </div>`,
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: `Remove entire set (${requiredQty} pcs)`,
        denyButtonText:    `Remove only make-to-order qty (${remainingQty} pcs)`,
        cancelButtonText:  'Cancel',
        confirmButtonColor: '#dc3545',
        denyButtonColor:    '#007bff',
        cancelButtonColor:  '#6c757d',
      });

      if (result.isConfirmed) {
        const removed = this.makeToOrderItems.splice(index, 1)[0];
        if (removed) {
          this.removedFromPartial.push({ ...removed, removalType: 'full' });
          this.communicationService.customSuccess(
            `Entire set removed: ${item.designNumber} - ${item.colourName} - ${item.size} (${requiredQty} pcs)`
          );
        }
      } else if (result.isDenied) {
        const removed = this.makeToOrderItems.splice(index, 1)[0];
        if (removed) {
          this.confirmedItems.push({
            ...removed,
            quantity:         dispatchQty,
            expectedQty:      dispatchQty,
            remainingQuantity: 0,
            status:           'm_confirmed'
          });
          this.removedFromPartial.push({
            ...removed,
            quantity:          0,
            remainingQuantity: remainingQty,
            removalType:       'partial'
          });
          this.communicationService.customSuccess(
            `Make-to-order qty removed and dispatch qty moved to confirmed: ${item.designNumber} - ${item.colourName} - ${item.size}`
          );
        }
      }
    }
  }

  // ── Preview ─────────────────────────────────────────────────────────────────

  openPreview(): void {
    const removedIds = new Set((this.removedFromPartial || []).map((x: any) => x._id));

    const confirmedFromPartial = (this.makeToOrderItems || [])
      .filter(x => !removedIds.has(x._id))
      .map(x => ({
        ...x,
        quantity:    Number(x.availableQuantity ?? x.quantity) || 0,
        expectedQty: Number(x.expectedQty ?? x.quantity)       || 0
      }));

    this.previewConfirmedItems = [...(this.confirmedItems || []), ...confirmedFromPartial];

    this.previewMakeToOrderItems = (this.makeToOrderItems || [])
      .filter(x => !removedIds.has(x._id))
      .filter(x => (Number(x.remainingQuantity) || 0) > 0);

    this.showPreview = true;
  }

  closePreview(): void {
    this.showPreview = false;
  }

  // ── Action Buttons ──────────────────────────────────────────────────────────

  async onConfirmAndUpdatePOs(): Promise<void> {
    const ok = await this.showConfirmation('acceptBoth');
    if (!ok) return;
    this.openPreview();
  }

  async finalizeConfirmAndUpdatePOs(): Promise<void> {
    this.isLoading = true;
    try {
      this.finalRemaining = [...this.previewConfirmedItems, ...this.previewMakeToOrderItems];
      await this.updatePOExcludingRemoved();
      await this.createMakeToOrderPOExcludingRemoved();
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

  async onCancelOrder(): Promise<void> {
    const ok = await this.showConfirmation('rejectAll');
    if (!ok) return;
    this.isLoading = true;
    try {
      await this.updateInventoryBulk();
      await this.updatePOStatus('w_order_cancelled');   // ✅ wholesaler cancel status
      this.showSuccessMessage('rejectAll');
      setTimeout(() => this.navigateFun(), 2000);
    } catch (err) {
      console.error('Cancel Order error:', err);
      this.showErrorMessage('Failed to cancel order.');
    } finally {
      this.isLoading = false;
    }
  }

  // ── API Calls ───────────────────────────────────────────────────────────────

  private updatePOStatus(status: string): Promise<any> {
    return this.authService
      .patchpimage(`po-wholesaler-to-manufacture/${this.responseData.id}`, { statusAll: status })
      .pipe(retry(2), catchError(err => throwError(() => err)))
      .toPromise();
  }

  private updatePOExcludingRemoved(): Promise<any> {
    const removedMap    = new Map((this.removedFromPartial || []).map((x: any) => [x._id, x]));
    const originalSet: any[] = this.responseData?.set || [];

    const updatedSet = originalSet.map((item: any) => {
      const expectedQty = Number(item.quantity)          || 0;
      const available   = Number(item.availableQuantity) || 0;
      const removed     = removedMap.get(item._id);

      if (removed) {
        if (removed.removalType === 'full') {
          return { ...item, expectedQty, quantity: 0, availableQuantity: 0, status: 'w_cancelled' };
        } else if (removed.removalType === 'partial') {
          return { ...item, expectedQty: available, quantity: available, availableQuantity: available, status: 'm_confirmed' };
        }
      }
      return { ...item, expectedQty, quantity: available, status: 'm_confirmed' };
    });

    return this.authService
      .patchpimage(`po-wholesaler-to-manufacture/${this.responseData.id}`, {
        statusAll: 'm_order_confirmed',
        set: updatedSet
      })
      .pipe(retry(2), catchError(err => throwError(() => err)))
      .toPromise();
  }

  private createMakeToOrderPOExcludingRemoved(): Promise<any> {
    const removedFullIds = new Set(
      (this.removedFromPartial || [])
        .filter((x: any) => x.removalType === 'full')
        .map((x: any) => x._id)
    );

    const makeToOrderSet = (this.makeToOrderItems || [])
      .filter(item => !removedFullIds.has(item._id))
      .filter(item => (Number(item.remainingQuantity) || 0) > 0)
      .map(item => ({
        ...item,
        quantity:          Number(item.remainingQuantity) || 0,
        availableQuantity: 0,
        confirmed:         false,
        rejected:          false,
        status:            'make_to_order'
      }));

    if (makeToOrderSet.length === 0) return Promise.resolve();

    const payload = {
      previousPoNumber:        this.responseData.poNumber,
      previousPoId:            this.responseData.id,
      statusAll:               'make_to_order',
      set:                     makeToOrderSet,
      manufacturer:            this.responseData.manufacturer,
      wholesaler:              this.responseData.wholesaler,           // ✅ wholesaler key
      transportDetails:        this.responseData.transportDetails,
      bankDetails:             this.responseData.bankDetails,
      wholesalerEmail:         this.responseData.wholesalerEmail,      // ✅ wholesaler email key
      manufacturerEmail:       this.responseData.manufacturerEmail,
      discount:                this.responseData.discount,
      wholesalerPODateCreated: new Date(),                             // ✅ wholesaler date key
      expDeliveryDate:         this.responseData.partialDeliveryDate,
      partialDeliveryDate:     this.responseData.partialDeliveryDate,
    };

    return this.authService
      .post('po-wholesaler-to-manufacture/make-to-order', payload)   // ✅ wholesaler endpoint
      .pipe(retry(2), catchError(err => throwError(() => err)))
      .toPromise();
  }

  private updateInventoryBulk(): Promise<any> {
    const itemsToUpdate = (this.responseData?.set || []).filter(
      (item: any) => item.availableQuantity && Number(item.availableQuantity) > 0
    );
    if (itemsToUpdate.length === 0) return Promise.resolve();

    const updates = itemsToUpdate.map((item: any) => ({
      designNumber: item.designNumber,
      colourName:   item.colourName,
      standardSize: item.size,
      quantity:     Number(item.availableQuantity),
      status:       'add',
      lastUpdatedBy: 'Admin',
      userEmail:    this.responseData?.manufacturer?.email
    }));

    return this.authService
      .post('manufacture-inventory/update-bulk', { updates })
      .pipe(retry(2), catchError(err => throwError(() => err)))
      .toPromise();
  }

  private updateInventoryForRemoved(): Promise<any> {
    const itemsToAdd = (this.removedFromPartial || []).filter(
      (x: any) => x.removalType === 'full' && Number(x.availableQuantity) > 0
    );
    if (itemsToAdd.length === 0) return Promise.resolve();

    const updates = itemsToAdd.map((item: any) => ({
      designNumber:  item.designNumber,
      colourName:    item.colourName,
      standardSize:  item.size,
      quantity:      Number(item.availableQuantity),
      status:        'add',
      lastUpdatedBy: 'Admin',
      userEmail:     this.responseData?.manufacturer?.email
    }));

    return this.authService
      .post('manufacture-inventory/update-bulk', { updates })
      .pipe(retry(2), catchError(err => throwError(() => err)))
      .toPromise();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  async showConfirmation(action: string): Promise<boolean> {
    const messages: Record<string, { title: string; text: string }> = {
      acceptBoth: {
        title: 'Generate New PO?',
        text:  'This will update the current PO with available items and create a new Make-to-Order PO for remaining items.'
      },
      rejectAll: {
        title: 'Cancel Entire Order?',
        text:  'This will cancel the complete purchase order.'
      }
    };
    const { title, text } = messages[action] || { title: 'Confirm?', text: '' };
    const result = await Swal.fire({
      title, text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText:  'Cancel',
      confirmButtonColor: '#007bff',
      cancelButtonColor:  '#6c757d'
    });
    return result.isConfirmed;
  }

  showSuccessMessage(action: string): void {
    const messages: Record<string, string> = {
      acceptBoth: 'Order Updated and New Make to Order created',
      rejectAll:  'Order cancelled successfully'
    };
    Swal.fire({
      icon: 'success', title: 'Success!',
      text: messages[action] || 'Done',
      timer: 2000, showConfirmButton: false
    });
  }

  showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error', title: 'Error',
      text: message || 'Something went wrong. Please try again.',
      confirmButtonColor: '#007bff'
    });
  }

  navigateFun(): void { this.location.back(); }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) return '';
    try { return gstin.substring(2, 12).toUpperCase(); } catch { return ''; }
  }
}
