import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ViewPoItem {
  _id: string;
  clothing: string;
  gender: string;
  designNumber: string;
  colourName: string;
  colour?: string;
  colourImage: string;
  size: string;
  quantity: number;           // Required Qty
  availableQuantity: number;  // Confirmed Qty
  price: string;
  hsnCode: string;
  hsnGst: number;
  status: string;
  confirmed: boolean;
  rejected: boolean;
  productType: string;
  brandName?: string;
}

interface ViewTransportDetails {
  _id?: string;
  modeOfTransport: string;
  transportType: string;
  transporterCompanyName: string;
  contactNumber: number;
  contactPersonName: string;
  vehicleNumber?: string;
  altContactNumber?: number;
  trackingId?: string;
  deliveryAddress?: string;
  remarks?: string;
  gstNumber?: string;
  note?: string;
}

interface Wholesaler {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
  profileImg: string;
}

interface Manufacturer {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  swiftCode?: string;
  upiId: string;
  bankAddress: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-view-updated-wholsaler-po-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-updated-wholsaler-po-order.component.html',
  styleUrl: './view-updated-wholsaler-po-order.component.scss'
})
export class ViewUpdatedWholsalerPoOrderComponent implements OnInit {

  // Wholesaler display fields
  wholesalerCompany!: string;
  wholesalerEmail!: string;
  wholesalerMobile!: string;
  wholesalerGSTIN!: string;
  wholesalerPAN!: string;
  wholesalerLogo!: string;
  wholesalerAddress!: string;

  // Manufacturer details
  manufacturerCompany!: string;
  manufacturerEmail!: string;
  manufacturerMobile!: string;
  manufacturerGSTIN!: string;
  manufacturerAddress!: string;
  manufacturerProfile!: Manufacturer;

  // Bank details
  bankDetails!: BankDetails;

  // Order fields
  poNumber!: number;
  poDate!: Date;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  orderedSet: ViewPoItem[] = [];
  PoId!: string;

  // Status & extras
  statusAll!: string;
  transportDetails!: ViewTransportDetails;
  manufacturerNote: string = '';
  isLoading = true;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.PoId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.PoId) return;
    this.loadPoData();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  private loadPoData() {
    this.isLoading = true;
    this.authService
      .get(`po-wholesaler-to-manufacture/${this.PoId}`)
      .subscribe({
        next: (res: any) => {
          this.mapResponseData(res);
          this.isLoading = false;
        },
        error: err => {
          console.error('Failed to load PO data', err);
          this.isLoading = false;
        }
      });
  }

  private mapResponseData(po: any) {
    // 1) Wholesaler header
    const w = po.wholesaler;
    this.wholesalerCompany  = w.companyName;
    this.wholesalerEmail    = w.email;
    this.wholesalerMobile   = w.mobNumber;
    this.wholesalerGSTIN    = w.GSTIN;
    this.wholesalerPAN      = w.GSTIN ? w.GSTIN.substring(2, 12) : '';
    this.wholesalerLogo     = w.profileImg || w.logo || '';   // ✅ profileImg from API
    this.wholesalerAddress  = `${w.address}, ${w.pinCode} – ${w.state}`;

    // 2) Manufacturer details
    const m = po.manufacturer;
    this.manufacturerProfile  = m;
    this.manufacturerCompany  = m.companyName;
    this.manufacturerEmail    = m.email;
    this.manufacturerMobile   = m.mobNumber;
    this.manufacturerGSTIN    = m.GSTIN;
    this.manufacturerAddress  = `${m.address}, ${m.pinCode} – ${m.state}`;

    // 3) Bank details — comes directly in PO response for wholesaler
    if (po.bankDetails) {
      this.bankDetails = {
        accountHolderName: po.bankDetails.accountHolderName || '',
        accountNumber:     po.bankDetails.accountNumber     || '',
        accountType:       po.bankDetails.accountType       || '',
        bankName:          po.bankDetails.bankName          || '',
        branchName:        po.bankDetails.branchName        || '',
        ifscCode:          po.bankDetails.ifscCode          || '',
        swiftCode:         po.bankDetails.swiftCode         || '',
        upiId:             po.bankDetails.upiId             || '',
        bankAddress:       po.bankDetails.bankAddress       || ''
      };
    }

    // 4) Order metadata
    this.poNumber            = po.poNumber;
    this.poDate              = new Date(po.wholesalerPODateCreated);  // ✅ wholesaler field
    this.statusAll           = po.statusAll;
    this.manufacturerNote    = po.manufacturerNote || '';
    this.transportDetails    = po.transportDetails || {};
    this.expDeliveryDate     = po.expDeliveryDate     ? new Date(po.expDeliveryDate)     : null;
    this.partialDeliveryDate = po.partialDeliveryDate ? new Date(po.partialDeliveryDate) : null;

    // 5) Map set items — use `item.quantity` (API field) ✅
    this.orderedSet = po.set.map((item: any) => ({
      _id:               item._id,
      clothing:          item.clothing,
      gender:            item.gender,
      designNumber:      item.designNumber,
      colourName:        item.colourName,
      colour:            item.colour,
      colourImage:       item.colourImage || '',
      size:              item.size,
      quantity:          item.quantity,           // ✅ correct API field
      availableQuantity: item.availableQuantity,
      price:             item.price || '0',
      hsnCode:           item.hsnCode || '',
      hsnGst:            item.hsnGst  || 0,
      status:            item.status,
      confirmed:         item.confirmed  || false,
      rejected:          item.rejected   || false,
      productType:       item.productType || '',
      brandName:         item.brandName  || ''
    }));
  }

  // ─── Status Helpers ───────────────────────────────────────────────────────────

  isPartialDelivery(): boolean {
    return this.statusAll === 'm_partial_delivery';
  }

  isFullyConfirmed(): boolean {
    return this.statusAll === 'm_order_confirmed';
  }

  hasQuantityMismatch(item: ViewPoItem): boolean {
    return item.quantity !== item.availableQuantity;
  }

  // ✅ Fixed: was comparing item.totalQuantity (undefined) — now uses item.quantity
  isPartialRow(item: ViewPoItem): boolean {
    return this.statusAll === 'm_partial_delivery' &&
           item.availableQuantity !== item.quantity;
  }

  getStatusBadgeClass(): string {
    switch (this.statusAll) {
      case 'm_order_confirmed':  return 'badge-success';
      case 'm_partial_delivery': return 'badge-warning';
      default:                   return 'badge-secondary';
    }
  }

  getStatusText(): string {
    switch (this.statusAll) {
      case 'm_order_confirmed':  return 'Fully Confirmed';
      case 'm_partial_delivery': return 'Partial Delivery';
      default:                   return 'Pending';
    }
  }

  // ─── Count Helpers ────────────────────────────────────────────────────────────

  getConfirmedItemsCount(): number {
    return this.orderedSet.filter(i => i.status === 'm_confirmed').length;
  }

  getPartialItemsCount(): number {
    return this.orderedSet.filter(i => i.status === 'm_partial_delivery').length;
  }

  getTotalItemsCount(): number {
    return this.orderedSet.length;
  }

  // ─── Amount Helpers ───────────────────────────────────────────────────────────

  getItemTotal(item: ViewPoItem): number {
    return item.availableQuantity * parseFloat(item.price);
  }

  getPendingAmount(item: ViewPoItem): number {
    return (item.quantity - item.availableQuantity) * parseFloat(item.price);
  }

  getTotalAmount(): number {
    return this.orderedSet.reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  getTotalWithGST(): number {
    return this.orderedSet.reduce((total, item) => {
      const itemTotal  = this.getItemTotal(item);
      const gstAmount  = (itemTotal * item.hsnGst) / 100;
      return total + itemTotal + gstAmount;
    }, 0);
  }

  navigateBack() {
    this.location.back();
  }
}
