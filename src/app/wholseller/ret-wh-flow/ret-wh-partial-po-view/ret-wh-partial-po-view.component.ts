import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';

interface ViewPoItem {
  _id: string;
  clothing: string;
  gender: string;
  designNumber: string;
  colourName: string;
  size: string;
  quantity: number; // Required quantity
  availableQuantity: number; // Confirmed quantity
  price: string;
  hsnCode: string;
  hsnGst: number;
  status: string;
  colour?: string;
  confirmed: boolean;
  rejected: boolean;
  productType: string;
  colourImage: string;
  brandName?: string;
  subCategory?: string;
  productBy?: string;
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
  dispatchDate?: Date;
  expectedDeliveryDate?: Date;
  deliveryDate?: Date;
  deliveryAddress?: string;
  remarks?: string;
  gstNumber?: string;
  note?: string;
}

interface Retailer {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
  logo: string;
  productDiscount: string;
  category: string;
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

@Component({
  selector: 'app-ret-wh-partial-po-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ret-wh-partial-po-view.component.html',
  styleUrl: './ret-wh-partial-po-view.component.scss'
})
export class RetWhPartialPoViewComponent implements OnInit {
  // Retailer details
  retailerCompany!: string;
  retailerEmail!: string;
  retailerMobile!: string;
  retailerGSTIN!: string;
  retailerPAN!: string;
  retailerLogo!: string;
  retailerAddress!: string;
  
  // Wholesaler details
  wholesalerCompany!: string;
  wholesalerEmail!: string;
  wholesalerMobile!: string;
  wholesalerGSTIN!: string;
  wholesalerPAN!: string;
  wholesalerAddress!: string;
  
  // Bank details and wholesaler profile properties
  bankDetails!: BankDetails;
  wholesalerProfile!: Wholesaler;
  
  // Order details
  poNumber!: number;
  poDate!: Date;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  orderedSet: ViewPoItem[] = [];
  PoId!: string;
  discount!: number;
  
  // Status and delivery info
  statusAll!: string;
  transportDetails!: ViewTransportDetails;
  wholesalerNote!: string;
  
  // Summary calculations
  totalConfirmedItems: number = 0;
  totalPendingItems: number = 0;
  totalConfirmedAmount: number = 0;
  totalPendingAmount: number = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.PoId = this.route.snapshot.paramMap.get('id') || '';
    this.loadPoData();
  }

  private loadPoData() {
    this.authService.get(`/po-retailer-to-wholesaler/${this.PoId}`)
      .subscribe({
        next: (response: any) => {
          this.mapResponseData(response);
        },
        error: err => console.error('Failed to load PO data', err)
      });
  }

  private mapResponseData(po: any) {
    // Map retailer details
    const r = po.retailer;
    this.retailerCompany = r.companyName;
    this.retailerEmail = r.email;
    this.retailerMobile = r.mobNumber;
    this.retailerGSTIN = r.GSTIN;
    this.retailerPAN = r.GSTIN ? r.GSTIN.substring(2, 12) : '';
    this.retailerLogo = r.logo || '';
    this.retailerAddress = `${r.address}, ${r.pinCode} – ${r.state}`;
    
    // Map wholesaler details
    const w = po.wholesaler;
    this.wholesalerCompany = w.companyName;
    this.wholesalerEmail = w.email;
    this.wholesalerMobile = w.mobNumber;
    this.wholesalerGSTIN = w.GSTIN;
    this.wholesalerPAN = w.GSTIN ? w.GSTIN.substring(2, 12) : '';
    this.wholesalerAddress = `${w.address}, ${w.pinCode} – ${w.state}`;
    
    // Store wholesaler profile for bank details display
    this.wholesalerProfile = w;
    
    // Map bank details
    if (po.bankDetails || po.wholesaler?.bankDetails) {
      const bankData = po.bankDetails || po.wholesaler.bankDetails;
      this.bankDetails = {
        accountHolderName: bankData.accountHolderName,
        accountNumber: bankData.accountNumber,
        accountType: bankData.accountType,
        bankName: bankData.bankName,
        branchName: bankData.branchName,
        ifscCode: bankData.ifscCode,
        swiftCode: bankData.swiftCode,
        upiId: bankData.upiId,
        bankAddress: bankData.bankAddress
      };
    }
    
    // Order details
    this.poNumber = po.poNumber;
    this.poDate = new Date(po.retailerPoDate);
    this.discount = po.discount;
    this.statusAll = po.statusAll;
    this.wholesalerNote = po.wholesalerNote || '';
    
    // Transport details
    this.transportDetails = po.transportDetails || {};
    
    // Set delivery dates
    this.expDeliveryDate = po.expDeliveryDate ? new Date(po.expDeliveryDate) : null;
    this.partialDeliveryDate = po.partialDeliveryDate ? new Date(po.partialDeliveryDate) : null;

    // Map order items
    this.orderedSet = po.set.map((item: any) => ({
      _id: item._id,
      clothing: item.clothing,
      gender: item.gender,
      designNumber: item.designNumber,
      colourName: item.colourName,
      size: item.size,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      price: item.price,
      hsnCode: item.hsnCode,
      hsnGst: item.hsnGst,
      status: item.status,
      colour: item.colour,
      confirmed: item.confirmed,
      rejected: item.rejected,
      productType: item.productType,
      colourImage: item.colourImage,
      brandName: item.brandName || '',
      subCategory: item.subCategory || '',
      productBy: item.productBy || ''
    }));
  }

  getConfirmedItemsCount(): number {
    return this.orderedSet.filter(item => item.status === 'w_confirmed').length;
  }

  getPartialItemsCount(): number {
    return this.orderedSet.filter(item => item.status === 'w_partial').length;
  }

  getTotalItemsCount(): number {
    return this.orderedSet.length;
  }

  // UI helper methods
  isPartialDelivery(): boolean {
    return this.statusAll === 'partial_delivery';
  }

  isFullyConfirmed(): boolean {
    return this.statusAll === 'w_order_confirmed' || 
           (this.getPartialItemsCount() === 0 && this.getConfirmedItemsCount() > 0);
  }

  hasQuantityMismatch(item: ViewPoItem): boolean {
    return item.quantity !== item.availableQuantity;
  }

  getStatusBadgeClass(): string {
    if (this.isFullyConfirmed()) {
      return 'badge-success';
    } else if (this.isPartialDelivery()) {
      return 'badge-warning';
    }
    return 'badge-secondary';
  }

  getStatusText(): string {
    if (this.isFullyConfirmed()) {
      return 'Fully Confirmed';
    } else if (this.isPartialDelivery()) {
      return 'Partial Delivery';
    }
    return 'Unknown Status';
  }

  navigateBack() {
    this.location.back();
  }

  getItemTotal(item: ViewPoItem): number {
    return item.availableQuantity * parseFloat(item.price);
  }

  getPendingAmount(item: ViewPoItem): number {
    return (item.quantity - item.availableQuantity) * parseFloat(item.price);
  }

  getTotalAmount(): number {
    return this.orderedSet.reduce((total, item) => {
      return total + this.getItemTotal(item);
    }, 0);
  }

  getTotalWithGST(): number {
    return this.orderedSet.reduce((total, item) => {
      const itemTotal = this.getItemTotal(item);
      const gstAmount = (itemTotal * item.hsnGst) / 100;
      return total + itemTotal + gstAmount;
    }, 0);
  }
}
