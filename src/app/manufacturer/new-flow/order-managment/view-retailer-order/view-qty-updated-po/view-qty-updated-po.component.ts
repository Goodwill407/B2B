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

// Add BankDetails interface
interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  swiftCode?: string;
  upiId:string;
  bankAddress: string;
}

@Component({
  selector: 'app-view-qty-updated-po',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-qty-updated-po.component.html',
  styleUrl: './view-qty-updated-po.component.scss'
})
export class ViewQtyUpdatedPoComponent implements OnInit {
  // Retailer details
  retailerCompany!: string;
  retailerEmail!: string;
  retailerMobile!: string;
  retailerGSTIN!: string;
  retailerPAN!: string;
  retailerLogo!: string;
  retailerAddress!: string;
  
  // Manufacturer details (keeping these for reference if needed)
  manufacturerCompany!: string;
  manufacturerEmail!: string;
  manufacturerMobile!: string;
  manufacturerGSTIN!: string;
  manufacturerPAN!: string;
  manufacturerAddress!: string;
  
  // Add bank details and manufacturer profile properties
  bankDetails!: BankDetails;
  manufacturerProfile!: Manufacturer;
  
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
  manufacturerNote!: string;
  
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
    this.authService.get(`po-retailer-to-manufacture/${this.PoId}`)
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
    
    // Map manufacturer details
    const m = po.manufacturer;
    this.manufacturerCompany = m.companyName;
    this.manufacturerEmail = m.email;
    this.manufacturerMobile = m.mobNumber;
    this.manufacturerGSTIN = m.GSTIN;
    this.manufacturerPAN = m.GSTIN ? m.GSTIN.substring(2, 12) : '';
    this.manufacturerAddress = `${m.address}, ${m.pinCode} – ${m.state}`;
    
    // Store manufacturer profile for bank details display
    this.manufacturerProfile = m;
    
    // Map bank details (assuming it comes from the API response)
    if (po.bankDetails || po.manufacturer?.bankDetails) {
      const bankData = po.bankDetails || po.manufacturer.bankDetails;
      this.bankDetails = {
        accountHolderName:bankData.accountHolderName,
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
    this.manufacturerNote = po.manufacturerNote || '';
    
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
      brandName: item.brandName || ''
    }));

    // Calculate summaries
    this.calculateSummaries();
  }

  private calculateSummaries() {
    this.totalConfirmedItems = this.orderedSet.filter(item => item.confirmed).length;
    this.totalPendingItems = this.orderedSet.filter(item => !item.confirmed).length;
    
    this.totalConfirmedAmount = this.orderedSet
      .filter(item => item.confirmed)
      .reduce((sum, item) => sum + this.getItemTotal(item), 0);
    
    this.totalPendingAmount = this.orderedSet
      .filter(item => !item.confirmed)
      .reduce((sum, item) => sum + this.getPendingAmount(item), 0);
  }

  // UI helper methods
  isPartialDelivery(): boolean {
    return this.statusAll === 'm_partial_delivery';
  }

  isFullyConfirmed(): boolean {
    return this.statusAll === 'm_order_confirmed';
  }

  hasQuantityMismatch(item: ViewPoItem): boolean {
    return item.quantity !== item.availableQuantity;
  }

  getStatusBadgeClass(): string {
    switch (this.statusAll) {
      case 'm_order_confirmed':
        return 'badge-success';
      case 'm_partial_delivery':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  getStatusText(): string {
    switch (this.statusAll) {
      case 'm_order_confirmed':
        return 'Fully Confirmed';
      case 'm_partial_delivery':
        return 'Partial Delivery';
      default:
        return 'Unknown Status';
    }
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
