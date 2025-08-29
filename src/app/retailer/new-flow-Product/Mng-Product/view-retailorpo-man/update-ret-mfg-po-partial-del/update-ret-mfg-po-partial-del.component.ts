import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
// import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';

// Interfaces
interface ItemDecision {
  itemId: string;
  originalQuantity: number;
  availableQuantity: number;
  acceptedQuantity: number;
  makeToOrderQuantity: number;
  action: 'accept_full' | 'accept_partial' | 'make_to_order' | 'cancel';
  expectedDeliveryDate: Date;
  remarks: string;
}

interface PartialDeliveryUpdate {
  itemUpdates: ItemDecision[];
  businessReason: string;
  remarks: string;
  prioritizeSpeed: boolean;
  maxWaitTime?: number;
  allowSplit: boolean;
  minimumOrderValue?: number;
}

interface POSplit {
  immediate: any[];
  makeToOrder: any[];
  immediateTotals: any;
  makeToOrderTotals: any;
}

@Component({
  selector: 'app-update-ret-mfg-po-partial-del',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, InputNumberModule,
    DropdownModule, CheckboxModule, CalendarModule, CardModule, // TextareaModule,
    TabViewModule, ProgressBarModule, BadgeModule, MessageModule, IndianCurrencyPipe, AmountInWordsPipe
  ],
  templateUrl: './update-ret-mfg-po-partial-del.component.html',
  styleUrl: './update-ret-mfg-po-partial-del.component.scss'
})
export class UpdateRetMfgPoPartialDelComponent implements OnInit {
  // Data Properties
  responseData: any;
  originalPO: any = {};
  itemDecisions: ItemDecision[] = [];
  
  // UI Properties
  currentStep: number = 1;
  isLoading: boolean = false;
  showPreview: boolean = false;
  minDate: Date = new Date();
  
  // Form Properties
  updateData: PartialDeliveryUpdate = {
    itemUpdates: [],
    businessReason: '',
    remarks: '',
    prioritizeSpeed: true,
    allowSplit: true,
    minimumOrderValue: 10000
  };
  
  // Dropdown Options
  actionOptions = [
    { label: 'Accept Full Quantity', value: 'accept_full', icon: 'pi pi-check-circle', disabled: false },
    { label: 'Accept Partial Only', value: 'accept_partial', icon: 'pi pi-minus-circle', disabled: false },
    { label: 'Make to Order', value: 'make_to_order', icon: 'pi pi-clock', disabled: false },
    { label: 'Cancel Item', value: 'cancel', icon: 'pi pi-times-circle', disabled: false }
  ];
  
  businessReasons = [
    'Market demand changed',
    'Budget constraints',
    'Seasonal requirements',
    'Quality concerns',
    'Alternative supplier found',
    'Customer preferences updated',
    'Inventory optimization'
  ];

  // Calculations
  isIntraState: boolean = false;
  poSplit: POSplit = {
    immediate: [],
    makeToOrder: [],
    immediateTotals: { totalWithGST: 0, totalQty: 0 },
    makeToOrderTotals: { totalWithGST: 0, totalQty: 0 }
  };

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
        this.initializeDecisions();
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
    this.originalPO = {
      supplierName: res.manufacturer?.companyName || '',
      supplierAddress: `${res.manufacturer?.address}, ${res.manufacturer?.pinCode} - ${res.manufacturer?.state}`,
      supplierContact: res.manufacturer?.mobNumber || '',
      supplierGSTIN: res.manufacturer?.GSTIN || '',
      supplierEmail: res.manufacturer?.email || '',

      buyerName: res.retailer?.companyName || '',
      buyerAddress: `${res.retailer?.address}, ${res.retailer?.pinCode} - ${res.retailer?.state}`,
      buyerPhone: res.retailer?.mobNumber || '',
      buyerEmail: res.retailer?.email || '',
      buyerGSTIN: res.retailer?.GSTIN || '',

      logoUrl: res.retailer?.logo || '',
      poDate: new Date(res.retailerPoDate).toLocaleDateString(),
      orderNumber: res.poNumber,
      products: res.set || [],
      ProductDiscount: parseFloat(res.discount || 0),
      transportDetails: res.transportDetails,
      bankDetails: res.bankDetails
    };
  }

  initializeDecisions() {
    // Initialize array with proper objects (no optional properties)
    this.itemDecisions = this.originalPO.products.map((item: any) => ({
      itemId: item._id,
      originalQuantity: item.quantity || 0,
      availableQuantity: item.availableQuantity || 0,
      acceptedQuantity: item.status === 'm_confirmed' ? (item.quantity || 0) : (item.availableQuantity || 0),
      makeToOrderQuantity: item.status === 'm_partial_delivery' ? ((item.quantity || 0) - (item.availableQuantity || 0)) : 0,
      action: item.status === 'm_confirmed' ? 'accept_full' : 'accept_partial' as 'accept_full' | 'accept_partial' | 'make_to_order' | 'cancel',
      expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      remarks: ''
    }));
    
    this.updateDecisionSummary();
  }

  updateStateType() {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = buyerState && supplierState && (buyerState === supplierState);
  }

  // Safe access methods
  getItemDecision(index: number): ItemDecision | null {
    return this.itemDecisions && this.itemDecisions[index] ? this.itemDecisions[index] : null;
  }

  getActionLabel(action: string): string {
    const option = this.actionOptions.find(opt => opt.value === action);
    return option?.label || 'Select Action';
  }

  // Item Decision Methods
  onItemActionChange(decision: ItemDecision | null, newAction: string) {
    if (!decision) return;
    
    decision.action = newAction as any;
    
    switch (newAction) {
      case 'accept_full':
        decision.acceptedQuantity = decision.originalQuantity;
        decision.makeToOrderQuantity = 0;
        break;
      case 'accept_partial':
        decision.acceptedQuantity = decision.availableQuantity;
        decision.makeToOrderQuantity = 0;
        break;
      case 'make_to_order':
        decision.acceptedQuantity = 0;
        decision.makeToOrderQuantity = decision.originalQuantity;
        break;
      case 'cancel':
        decision.acceptedQuantity = 0;
        decision.makeToOrderQuantity = 0;
        break;
    }
    
    this.updateDecisionSummary();
  }

  onQuantityChange(decision: ItemDecision | null, type: 'accepted' | 'makeToOrder') {
    if (!decision) return;
    
    const total = decision.acceptedQuantity + decision.makeToOrderQuantity;
    
    if (total > decision.originalQuantity) {
      if (type === 'accepted') {
        decision.acceptedQuantity = decision.originalQuantity - decision.makeToOrderQuantity;
      } else {
        decision.makeToOrderQuantity = decision.originalQuantity - decision.acceptedQuantity;
      }
    }
    
    // Update action based on quantities
    if (decision.acceptedQuantity === 0 && decision.makeToOrderQuantity === 0) {
      decision.action = 'cancel';
    } else if (decision.acceptedQuantity === decision.originalQuantity && decision.makeToOrderQuantity === 0) {
      decision.action = 'accept_full';
    } else if (decision.acceptedQuantity > 0 && decision.makeToOrderQuantity === 0) {
      decision.action = 'accept_partial';
    } else if (decision.acceptedQuantity === 0 && decision.makeToOrderQuantity > 0) {
      decision.action = 'make_to_order';
    }
    
    this.updateDecisionSummary();
  }

  updateDecisionSummary() {
    this.calculatePOSplit();
  }

  // Quick Action Methods
  acceptAllConfirmed() {
    this.itemDecisions.forEach(decision => {
      const item = this.originalPO.products.find((p: any) => p._id === decision.itemId);
      if (item?.status === 'm_confirmed') {
        decision.action = 'accept_full';
        decision.acceptedQuantity = decision.originalQuantity;
        decision.makeToOrderQuantity = 0;
      }
    });
    this.updateDecisionSummary();
  }

  acceptAllPartial() {
    this.itemDecisions.forEach(decision => {
      const item = this.originalPO.products.find((p: any) => p._id === decision.itemId);
      if (item?.status === 'm_partial_delivery') {
        decision.action = 'accept_partial';
        decision.acceptedQuantity = decision.availableQuantity;
        decision.makeToOrderQuantity = 0;
      }
    });
    this.updateDecisionSummary();
  }

  makeAllToOrder() {
    this.itemDecisions.forEach(decision => {
      const item = this.originalPO.products.find((p: any) => p._id === decision.itemId);
      if (item?.status === 'm_partial_delivery') {
        decision.action = 'make_to_order';
        decision.acceptedQuantity = 0;
        decision.makeToOrderQuantity = decision.originalQuantity;
      }
    });
    this.updateDecisionSummary();
  }

  cancelAllPartial() {
    this.itemDecisions.forEach(decision => {
      const item = this.originalPO.products.find((p: any) => p._id === decision.itemId);
      if (item?.status === 'm_partial_delivery') {
        decision.action = 'cancel';
        decision.acceptedQuantity = 0;
        decision.makeToOrderQuantity = 0;
      }
    });
    this.updateDecisionSummary();
  }

  // Calculation Methods
  calculatePOSplit() {
    this.poSplit.immediate = [];
    this.poSplit.makeToOrder = [];

    this.itemDecisions.forEach(decision => {
      const originalItem = this.originalPO.products.find((p: any) => p._id === decision.itemId);
      
      if (decision.acceptedQuantity > 0) {
        const immediateItem = {
          ...originalItem,
          quantity: decision.acceptedQuantity,
          deliveryType: 'immediate'
        };
        this.poSplit.immediate.push(immediateItem);
      }
      
      if (decision.makeToOrderQuantity > 0) {
        const makeToOrderItem = {
          ...originalItem,
          quantity: decision.makeToOrderQuantity,
          deliveryType: 'make_to_order',
          expectedDeliveryDate: decision.expectedDeliveryDate
        };
        this.poSplit.makeToOrder.push(makeToOrderItem);
      }
    });

    this.poSplit.immediateTotals = this.calculateTotals(this.poSplit.immediate);
    this.poSplit.makeToOrderTotals = this.calculateTotals(this.poSplit.makeToOrder);
  }

  calculateTotals(items: any[]) {
    let totalQty = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalWithGST = 0;

    for (const item of items) {
      const gst = this.getGstAmounts(item);
      totalQty += Number(item.quantity) || 0;
      totalTaxable += gst.taxable || 0;
      totalCGST += gst.cgst || 0;
      totalSGST += gst.sgst || 0;
      totalIGST += gst.igst || 0;
      totalWithGST += gst.totalWithGst || 0;
    }

    const discountPercent = Number(this.originalPO.ProductDiscount) || 0;
    const discountAmount = (totalWithGST * discountPercent) / 100;
    const finalTotal = totalWithGST - discountAmount;

    return { 
      totalQty, totalTaxable, totalCGST, totalSGST, totalIGST, 
      totalWithGST, discountAmount, finalTotal 
    };
  }

  getGstAmounts(item: any) {
    const quantity = +item.quantity;
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

  // Status and Progress Methods
  getItemStatusBadge(item: any): { severity: 'success' | 'warning' | 'info' | 'danger', value: string } {
    switch (item.status) {
      case 'm_confirmed':
        return { severity: 'success', value: 'Confirmed' };
      case 'm_partial_delivery':
        return { severity: 'warning', value: 'Partial' };
      default:
        return { severity: 'info', value: 'Pending' };
    }
  }

  getActionIcon(action: string) {
    const option = this.actionOptions.find(opt => opt.value === action);
    return option?.icon || 'pi pi-circle';
  }

  getActionColor(action: string) {
    switch (action) {
      case 'accept_full': return 'success';
      case 'accept_partial': return 'warning';
      case 'make_to_order': return 'info';
      case 'cancel': return 'danger';
      default: return 'secondary';
    }
  }

  getAvailabilityProgress(item: any) {
    const decision = this.itemDecisions.find(d => d.itemId === item._id);
    if (!decision) return 0;
    return Math.round((decision.availableQuantity / decision.originalQuantity) * 100);
  }

  // Form Submission Methods
  submitDecisions() {
    if (!this.validateDecisions()) return;

    this.updateData.itemUpdates = this.itemDecisions;
    
    this.isLoading = true;
    const url = `po-partial-delivery-update/${this.responseData.id}`;
    
    this.authService.patch(url, this.updateData).subscribe({
      next: (res: any) => {
        this.communicationService.customSuccess('Purchase order updated successfully');
        this.router.navigate(['/purchase-orders']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error updating PO:', err);
        this.communicationService.customError1('Failed to update purchase order');
        this.isLoading = false;
      }
    });
  }

  validateDecisions(): boolean {
    const hasDecisions = this.itemDecisions.some(d => 
      d.acceptedQuantity > 0 || d.makeToOrderQuantity > 0
    );
    
    if (!hasDecisions) {
      this.communicationService.customError1('Please accept at least one item');
      return false;
    }
    
    const hasInvalidQuantities = this.itemDecisions.some(d => 
      d.acceptedQuantity + d.makeToOrderQuantity > d.originalQuantity
    );
    
    if (hasInvalidQuantities) {
      this.communicationService.customError1('Total quantities cannot exceed original order');
      return false;
    }
    
    if (this.updateData.allowSplit && this.poSplit.immediate.length > 0 && this.poSplit.makeToOrder.length > 0) {
      if (this.poSplit.immediateTotals.finalTotal < (this.updateData.minimumOrderValue || 0)) {
        this.communicationService.customError1(`Immediate delivery PO must be at least ₹${this.updateData.minimumOrderValue}`);
        return false;
      }
    }
    
    return true;
  }

  // Navigation Methods
  nextStep() {
    if (this.currentStep === 1) {
      if (this.validateDecisions()) {
        this.currentStep = 2;
        this.showPreview = true;
      }
    } else if (this.currentStep === 2) {
      this.submitDecisions();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      if (this.currentStep === 1) {
        this.showPreview = false;
      }
    }
  }

  navigateBack() {
    this.location.back();
  }

  // Utility Methods
  get hasImmediateDelivery(): boolean {
    return this.poSplit.immediate.length > 0;
  }

  get hasMakeToOrder(): boolean {
    return this.poSplit.makeToOrder.length > 0;
  }

  get willSplitPO(): boolean {
    return this.hasImmediateDelivery && this.hasMakeToOrder;
  }

  get colspan(): number {
    return this.isIntraState ? 16 : 15;
  }
}
