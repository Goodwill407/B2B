import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, CommunicationService } from '@core';

interface PoItem {
  _id: string;
  clothing: string;
  gender: string;
  designNumber: string;
  colourName: string;
  size: string;
  quantity: number; // Required quantity
  availableQuantity: number; // Input quantity
  inventoryQuantity: number; // Current stock
  minimumQuantityAlert: number; // Alert threshold
  price: string;
  hsnCode: string;
  hsnGst: number;
  status: string;
  productId?: string;
  inventoryId?: string;
  colour?: string;
  confirmed: boolean;
  rejected: boolean;
  productType: string;
  colourImage: string;
  brandName: any; // Fixed: Added proper brandName
}

interface TransportDetails {
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

interface BankDetails {
  accountNumber: string;
  accountType: string;
  bankName: string;
  IFSCcode: string;
  swiftCode: string;
  country: string;
  city: string;
  branch: string;
  upiId: string;
}

interface ManufacturerProfile {
  fullName: string;
  companyName: string;
  email: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
  BankDetails: BankDetails;
}

@Component({
  selector: 'app-gen-retailer-order-po',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gen-retailer-order-po.component.html',
  styleUrls: ['./gen-retailer-order-po.component.scss']
})
export class GenRetailerOrderPoComponent implements OnInit {
  // Retailer details
  retailerCompany!: string;
  retailerEmail!: string;
  retailerMobile!: string;
  retailerGSTIN!: string;
  retailerPAN!: string;
  retailerLogo!: string;
  retailerAddress!: string;
  
  // Manufacturer details
  manufacturerProfile!: ManufacturerProfile;
  
  // Order details
  poNumber!: number;
  poDate!: Date;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  minDate!: string;
  orderedSet: PoItem[] = [];
  PoId!: string;
  discount!: number;
  
  // Transport and Bank details
  transportDetails!: TransportDetails;
  bankDetails!: BankDetails;
  
  // Status tracking
  currentStatusAll: string = 'pending';

  manufacturerNote: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.PoId = this.route.snapshot.paramMap.get('id') || '';
    const today = new Date();
    this.minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.loadData();
  }

  private loadData() {
    this.authService
      .get(`po-retailer-to-manufacture/${this.PoId}`)
      .pipe(
        switchMap((rawPo: any) => {
          const designNumbers = Array.from(new Set(rawPo.set.map((i: any) => i.designNumber)));
          const manufacturerEmail = rawPo.manufacturerEmail;
          
          return forkJoin({
            po: of(rawPo),
            inventoryRes: this.authService.post(
              'manufacture-inventory/by-designs',
              { designNumbers }
            ),
            manufacturerProfile: this.authService.get(`manufacturers/${manufacturerEmail}`)
          });
        })
      )
      .subscribe({
        next: ({ po, inventoryRes, manufacturerProfile }) => {
          const flatInv = inventoryRes?.data || [];
          this.mapResponses(po, flatInv, manufacturerProfile);
        },
        error: err => console.error('Load failed', err)
      });
  }

  private mapResponses(po: any, flatInventory: any[], manufacturerProfile: any) {
  // Group inventory by designNumber with ALL needed fields including inventory ID
  const inventoryMap = new Map<string, any[]>();
  for (const item of flatInventory) {
    if (!inventoryMap.has(item.designNumber)) {
      inventoryMap.set(item.designNumber, []);
    }
    inventoryMap.get(item.designNumber)!.push({
      standardSize: item.standardSize,
      colourName: item.colourName,
      quantity: item.quantity,
      minimumQuantityAlert: item.minimumQuantityAlert || 0,
      productId: item.productId || '',
      inventoryId: item.id || item._id || '', // NEW: Store inventory object ID
      brandName: item.brandName || ''
    });
  }

  // Map retailer details... (keep existing code)
  const r = po.retailer;
  this.retailerCompany = r.companyName;
  this.retailerEmail = r.email;
  this.retailerMobile = r.mobNumber;
  this.retailerGSTIN = r.GSTIN;
  this.retailerPAN = r.GSTIN ? r.GSTIN.substring(2, 12) : '';
  this.retailerLogo = r.logo || '';
  this.retailerAddress = `${r.address}, ${r.pinCode} – ${r.state}`;
  
  // Store manufacturer profile and bank details
  this.manufacturerProfile = manufacturerProfile;
  this.bankDetails = manufacturerProfile.BankDetails;
  
  // Order details
  this.poNumber = po.poNumber;
  this.poDate = new Date(po.retailerPoDate);
  this.discount = po.discount;
  this.currentStatusAll = po.statusAll;
  
  // Transport details
  this.transportDetails = po.transportDetails || {};
  
  // Set delivery dates
  this.expDeliveryDate = po.expDeliveryDate ? new Date(po.expDeliveryDate) : null;
  this.partialDeliveryDate = po.partialDeliveryDate ? new Date(po.partialDeliveryDate) : null;

  this.manufacturerNote = po.manufacturerNote || '';

  // Build table rows with inventory ID for updates
  this.orderedSet = po.set.map((item: any) => {
    const entries = inventoryMap.get(item.designNumber) || [];
    const match = entries.find((e: any) =>
      e.colourName.toLowerCase() === item.colourName.toLowerCase() &&
      e.standardSize.toLowerCase() === item.size.toLowerCase()
    );
    
    const invQty = match ? match.quantity : 0;
    const minAlert = match ? match.minimumQuantityAlert : 0;
    const defaultQty = item.availableQuantity || Math.min(item.quantity, invQty);

    return {
      _id: item._id,
      clothing: item.clothing,
      gender: item.gender,
      designNumber: item.designNumber,
      colourName: item.colourName,
      size: item.size,
      quantity: item.quantity,
      availableQuantity: defaultQty,
      inventoryQuantity: invQty,
      minimumQuantityAlert: minAlert,
      price: item.price,
      hsnCode: item.hsnCode,
      hsnGst: item.hsnGst,
      status: item.status,
      productId: match ? match.productId : '', // Keep for reference
      inventoryId: match ? match.inventoryId : '', // NEW: For inventory updates
      colour: item.colour,
      confirmed: item.confirmed || false,
      rejected: item.rejected || false,
      productType: item.productType,
      colourImage: item.colourImage,
      brandName: match ? match.brandName : ''
    };
  });
}

  // Enhanced validation methods
  hasInvalidQuantities(): boolean {
    return this.orderedSet.some(i =>
      i.availableQuantity > i.quantity ||
      i.availableQuantity > i.inventoryQuantity ||
      i.availableQuantity < 0
    );
  }

  hasInvalidQuantitiesForItem(item: PoItem): boolean {
    return item.availableQuantity > item.quantity ||
           item.availableQuantity > item.inventoryQuantity ||
           item.availableQuantity < 0;
  }

  hasPartialDelivery(): boolean {
  return this.orderedSet.some(i => i.quantity !== i.availableQuantity);
}

  // New methods for enhanced UI logic
  isLowStock(item: PoItem): boolean {
    return item.inventoryQuantity < item.minimumQuantityAlert && item.inventoryQuantity > 0;
  }

  isOutOfStock(item: PoItem): boolean {
    return item.inventoryQuantity === 0;
  }

  hasQuantityMismatch(item: PoItem): boolean {
    return item.quantity !== item.availableQuantity;
  }

  clampAvailableQuantity(item: PoItem) {
    if (item.availableQuantity < 0) item.availableQuantity = 0;
    const max = Math.min(item.quantity, item.inventoryQuantity);
    if (item.availableQuantity > max) item.availableQuantity = max;
  }

  preventInvalidInput(evt: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(evt.key)) evt.preventDefault();
  }

  navigateBack() {
    this.location.back();
  }

  // Status calculation methods (only partial and confirmed)
  private calculateItemStatus(item: PoItem): string {
    if (item.quantity !== item.availableQuantity) {
      return 'm_partial_delivery';
    } else {
      return 'm_confirmed';
    }
  }

  private calculateOverallStatus(): string {
  // Simple rule: If ANY item has Required Qty !== Input Qty, then partial
  const hasPartial = this.orderedSet.some(item => 
    item.quantity !== item.availableQuantity
  );
  
  // If all items have Required Qty === Input Qty, then confirmed
  const allConfirmed = this.orderedSet.every(item => 
    item.quantity === item.availableQuantity
  ) && this.orderedSet.length > 0;

  if (hasPartial) {
    return 'm_partial_delivery';
  } else if (allConfirmed) {
    return 'm_order_confirmed';
  } else {
    return 'pending'; // Edge case: empty set
  }
}

  // Bulk inventory update methods
private prepareBulkInventoryUpdate(): any {
  const userProfile = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const manufacturerEmail = userProfile.email || '';

  const updates = this.orderedSet
    .filter(item => item.availableQuantity > 0 && item.inventoryId) // Check for inventoryId
    .map(item => ({
      _id: item.inventoryId, // NEW: Use inventory object ID
      quantity: item.availableQuantity,
      status: "remove",
      lastUpdatedBy: manufacturerEmail
    }));

  return { updates };
}


  private async updateBulkInventory(): Promise<{success: boolean, message: string}> {
  const payload = this.prepareBulkInventoryUpdate();
  
  if (payload.updates.length === 0) {
    console.log('No inventory updates needed - no valid inventory IDs found');
    return { success: false, message: 'No valid inventory records found for update' };
  }

  // Check for missing inventory IDs
  const itemsWithoutInventoryId = this.orderedSet.filter(item => 
    item.availableQuantity > 0 && !item.inventoryId
  );
  
  if (itemsWithoutInventoryId.length > 0) {
    console.warn('⚠️ Some items missing inventory IDs:', itemsWithoutInventoryId.map(i => 
      `${i.designNumber}-${i.colourName}-${i.size}`
    ));
  }

  try {
    console.log('Simplified bulk inventory update payload:', payload);
    const response = await this.authService.post('manufacture-inventory/update-bulk', payload).toPromise();
    console.log('Inventory updated successfully:', response);
    return { success: true, message: 'Inventory updated successfully' };
  } catch (error) {
    console.error('Inventory update failed:', error);
    return { success: false, message: 'Inventory update failed' };
  }
}


  // Invoice generation method
  private async generateInvoice(): Promise<{success: boolean, message: string}> {
    const invoicePayload = {
      poId: this.PoId,
      poNumber: this.poNumber,
      invoiceNumber: `INV-${this.poNumber}-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      statusAll: "created",
      bankDetails: {
        accountHolderName: this.manufacturerProfile.companyName,
        accountNumber: this.bankDetails.accountNumber,
        bankName: this.bankDetails.bankName,
        branchName: this.bankDetails.branch,
        accountType: this.bankDetails.accountType,
        ifscCode: this.bankDetails.IFSCcode,
        swiftCode: this.bankDetails.swiftCode,
        upiId: "",
        bankAddress: `${this.bankDetails.city}, ${this.bankDetails.country}`
      },
      manufacturerEmail: this.manufacturerProfile.email,
      retailerEmail: this.retailerEmail,
      deliveryItems: this.orderedSet
        .filter(item => item.availableQuantity > 0)
        .map(item => ({
          designNumber: item.designNumber,
          colour: item.colour,
          colourName: item.colourName,
          colourImage: item.colourImage,
          size: item.size,
          quantity: item.availableQuantity,
          productType: item.productType,
          gender: item.gender,
          clothing: item.clothing,
          subCategory: item.clothing,
          hsnCode: item.hsnCode,
          hsnGst: item.hsnGst,
          hsnDescription: `${item.gender}'s ${item.clothing}`,
          status: "pending"
        })),
      manufacturer: this.manufacturerProfile,
      retailer: {
        email: this.retailerEmail,
        fullName: this.retailerCompany,
        companyName: this.retailerCompany,
        address: this.retailerAddress,
        state: "",
        country: "India",
        pinCode: "",
        mobNumber: this.retailerMobile,
        GSTIN: this.retailerGSTIN,
        logo: this.retailerLogo,
        productDiscount: this.discount.toString(),
        category: "Retail"
      },
      totalQuantity: this.orderedSet.reduce((sum, item) => sum + item.availableQuantity, 0),
      transportDetails: this.transportDetails,
      totalAmount: this.getTotalAmount(),
      discountApplied: this.getTotalAmount() * (this.discount / 100),
      finalAmount: this.getTotalAmount() * (1 - this.discount / 100)
    };

    try {
      const invoiceResponse = await this.authService.post('pi-manufacture-to-retailer', invoicePayload).toPromise();
      console.log('Invoice created successfully:', invoiceResponse);
      return { success: true, message: 'Invoice generated successfully' };
    } catch (error) {
      console.error('Invoice creation failed:', error);
      return { success: false, message: 'Invoice generation failed' };
    }
  }

  // BUSINESS CONTINUITY APPROACH - Main update method
  updatePoData() {
    if (this.hasInvalidQuantities()) {
      alert('Please fix invalid quantities before updating');
      return;
    }

    // Calculate statuses
    const updatedItems = this.orderedSet.map(item => ({
      _id: item._id,
      availableQuantity: item.availableQuantity,
      confirmed: item.availableQuantity > 0,
      rejected: false,
      status: this.calculateItemStatus(item)
    }));

    const calculatedStatusAll = this.calculateOverallStatus();

    // Prepare PO update data
    const poUpdateData = {
      set: updatedItems,
      statusAll: calculatedStatusAll,
      expDeliveryDate: this.expDeliveryDate,
      partialDeliveryDate: this.partialDeliveryDate,
      manufacturerNote: this.manufacturerNote,
      transportDetails: this.transportDetails,
      bankDetails: {
        accountHolderName: this.manufacturerProfile.companyName,
        accountNumber: this.bankDetails.accountNumber,
        bankName: this.bankDetails.bankName,
        branchName: this.bankDetails.branch,
        accountType: this.bankDetails.accountType,
        ifscCode: this.bankDetails.IFSCcode,
        swiftCode: this.bankDetails.swiftCode,
        upiId: "",
        bankAddress: `${this.bankDetails.city}, ${this.bankDetails.country}`
      },
    };

    console.log('Updating PO with data:', poUpdateData);

    // STEP 1: Update PO (CRITICAL - Must succeed or stop everything)
    this.authService.patchpimage(`po-retailer-to-manufacture/update-po-data/${this.PoId}`, poUpdateData)
      .subscribe({
        next: async (poResponse) => {
          console.log('✅ PO updated successfully:', poResponse);
          
          let inventorySuccess = false;
          let inventoryMessage = '';
          let invoiceSuccess = false;
          let invoiceMessage = '';

          // STEP 2: Update Inventory (CONTINUE EVEN IF FAILS)
          try {
            const inventoryResult = await this.updateBulkInventory();
            inventorySuccess = inventoryResult.success;
            inventoryMessage = inventoryResult.message;
          } catch (inventoryError) {
            console.warn('⚠️ Inventory update failed, but continuing:', inventoryError);
            inventorySuccess = false;
            inventoryMessage = 'Inventory sync failed';
          }

          // STEP 3: Generate Invoice (Only if confirmed, regardless of inventory status)
          if (calculatedStatusAll === 'm_order_confirmed') {
            try {
              const invoiceResult = await this.generateInvoice();
              invoiceSuccess = invoiceResult.success;
              invoiceMessage = invoiceResult.message;
            } catch (invoiceError) {
              console.error('❌ Invoice generation failed:', invoiceError);
              invoiceSuccess = false;
              invoiceMessage = 'Invoice generation failed';
            }
          }

          // BUSINESS CONTINUITY SUCCESS MESSAGES
          this.showBusinessContinuityMessage(
            calculatedStatusAll,
            inventorySuccess,
            invoiceSuccess,
            inventoryMessage,
            invoiceMessage
          );
          
          this.navigateBack();
        },
        error: (error) => {
          // PO UPDATE FAILED - STOP EVERYTHING
          console.error('❌ Critical: PO update failed - stopping all operations:', error);
          alert('❌ Failed to update Purchase Order. No changes were made.');
        }
      });
  }

  private showBusinessContinuityMessage(
  statusAll: string, 
  inventorySuccess: boolean, 
  invoiceSuccess: boolean,
  inventoryMessage: string,
  invoiceMessage: string
) {
  const isFullyConfirmed = statusAll === 'm_order_confirmed';
  const isPartialDelivery = statusAll === 'm_partial_delivery';

  if (isFullyConfirmed) {
    if (inventorySuccess && invoiceSuccess) {
      this.communicationService.customSuccess('Purchase Order confirmed, inventory updated, and invoice generated successfully!');
    } else if (inventorySuccess && !invoiceSuccess) {
      alert('✅ Purchase Order confirmed and inventory updated.\n⚠️ Invoice generation failed - please generate manually.');
    } else if (!inventorySuccess && invoiceSuccess) {
      alert('✅ Purchase Order confirmed and invoice generated.\n⚠️ Inventory sync failed - please update inventory manually.');
    } else {
      alert('✅ Purchase Order confirmed.\n⚠️ Please update inventory and generate invoice manually.');
    }
  } else if (isPartialDelivery) {
    if (inventorySuccess) {
      alert('✅ Purchase Order updated with partial delivery and inventory allocated!');
    } else {
      alert('✅ Purchase Order updated with partial delivery.\n⚠️ Inventory allocation failed - please update manually.');
    }
  } else {
    if (inventorySuccess) {
      alert('✅ Purchase Order updated and inventory allocated!');
    } else {
      alert('✅ Purchase Order updated.\n⚠️ Inventory allocation failed - please update manually.');
    }
  }
}

  // Helper calculation methods
  getTotalAmount(): number {
    return this.orderedSet.reduce((total, item) => {
      const itemTotal = item.availableQuantity * parseFloat(item.price);
      return total + itemTotal;
    }, 0);
  }

  getTotalWithGST(): number {
    return this.orderedSet.reduce((total, item) => {
      const itemTotal = item.availableQuantity * parseFloat(item.price);
      const gstAmount = (itemTotal * item.hsnGst) / 100;
      return total + itemTotal + gstAmount;
    }, 0);
  }
}
