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
  brandName: string;
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

interface WholesalerProfile {
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
  selector: 'app-ret-wh-po-qty-update',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ret-wh-po-qty-update.component.html',
  styleUrls: ['./ret-wh-po-qty-update.component.scss']
})
export class RetWhPoQtyUpdateComponent implements OnInit {
  // Retailer details
  retailerCompany!: string;
  retailerEmail!: string;
  retailerMobile!: string;
  retailerGSTIN!: string;
  retailerPAN!: string;
  retailerLogo!: string;
  retailerAddress!: string;

  // Wholesaler details
  wholesalerProfile!: WholesalerProfile;

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

  wholesalerNote: string = '';

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
      .get(`po-retailer-to-wholesaler/${this.PoId}`)
      .pipe(
        switchMap((rawPo: any) => {
          // Extract unique design numbers and brand names for inventory fetch
          const inventoryPayload = this.buildInventoryPayload(rawPo);
          const wholesalerEmail = rawPo.wholesalerEmail;

          return forkJoin({
            po: of(rawPo),
            inventoryRes: this.authService.post(
              'wholesaler-inventory/by-designs',
              inventoryPayload
            ),
            wholesalerProfile: this.authService.get(`wholesaler/${wholesalerEmail}`)
          });
        })
      )
      .subscribe({
        next: ({ po, inventoryRes, wholesalerProfile }) => {
          const flatInv = this.flattenInventoryResponse(inventoryRes);
          this.mapResponses(po, flatInv, wholesalerProfile);
        },
        error: err => console.error('Load failed', err)
      });
  }

  private buildInventoryPayload(po: any): any[] {
    // FIXED: Use pipe separator to avoid conflicts with design numbers containing hyphens
    const uniqueCombinations = new Map<string, { designNumber: string, brandName: string }>();

    po.set.forEach((item: any) => {
      // Use pipe separator to avoid split issues with design numbers like "LP-14"
      const key = `${item.designNumber}|${item.brandName}`;
      if (!uniqueCombinations.has(key)) {
        uniqueCombinations.set(key, {
          designNumber: item.designNumber,
          brandName: item.brandName
        });
      }
    });

    // Return the payload array with full design numbers
    return Array.from(uniqueCombinations.values()).map(combo => ({
      designNumbers: combo.designNumber,  // ✅ FIXED: Full design number preserved
      wholesalerEmail: po.wholesalerEmail,
      brandName: combo.brandName
    }));
  }

  private flattenInventoryResponse(inventoryRes: any): any[] {
    // FIXED: The API returns { success: true, data: [...] }
    // where data is already a flat array
    const flattened: any[] = [];

    if (inventoryRes?.data && Array.isArray(inventoryRes.data)) {
      // Data is already flat, just return it
      return inventoryRes.data.map((entry: any) => ({
        ...entry,
        // The designNumber is already in each entry
        designNumber: entry.designNumber,
        inventoryId: entry.id // Map 'id' to 'inventoryId' for consistency
      }));
    }

    return flattened;
  }

  private mapResponses(po: any, flatInventory: any[], wholesalerProfile: any) {
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
        inventoryId: item.inventoryId || item.id, // FIXED: Use inventoryId or id
        brandName: item.brandName || ''
      });
    }

    // Map retailer details
    const r = po.retailer;
    this.retailerCompany = r.companyName;
    this.retailerEmail = r.email;
    this.retailerMobile = r.mobNumber;
    this.retailerGSTIN = r.GSTIN;
    this.retailerPAN = r.GSTIN ? r.GSTIN.substring(2, 12) : '';
    this.retailerLogo = r.logo || '';
    this.retailerAddress = `${r.address}, ${r.pinCode} – ${r.state}`;

    // Store wholesaler profile and bank details
    this.wholesalerProfile = wholesalerProfile;
    this.bankDetails = wholesalerProfile.BankDetails;

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

    this.wholesalerNote = po.wholesalerNote || '';

    // Build table rows with inventory ID for updates
    this.orderedSet = po.set.map((item: any) => {
      const entries = inventoryMap.get(item.designNumber) || [];

      // FIXED: Better matching logic with case-insensitive and trim
      const match = entries.find((e: any) => {
        const colourMatch = e.colourName.trim().toLowerCase() === item.colourName.trim().toLowerCase();
        const sizeMatch = e.standardSize.trim().toLowerCase() === item.size.trim().toLowerCase();
        return colourMatch && sizeMatch;
      });

      const invQty = match ? match.quantity : 0;
      const minAlert = match ? match.minimumQuantityAlert : 0;
      const defaultQty = item.availableQuantity || Math.min(item.quantity, invQty);

      // DEBUG LOG - Remove in production
      console.log('Mapping item:', {
        designNumber: item.designNumber,
        colourName: item.colourName,
        size: item.size,
        matched: !!match,
        invQty: invQty,
        inventoryId: match ? match.inventoryId : 'NOT FOUND'
      });

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
        inventoryId: match ? match.inventoryId : '', // For inventory updates
        colour: item.colour,
        confirmed: item.confirmed || false,
        rejected: item.rejected || false,
        productType: item.productType,
        colourImage: item.colourImage,
        brandName: match ? match.brandName : item.brandName
      };
    });

    // DEBUG: Log final orderedSet - Remove in production
    console.log('Final orderedSet:', this.orderedSet);
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

  // Status calculation methods
  private calculateItemStatus(item: PoItem): string {
    if (item.quantity !== item.availableQuantity) {
      return 'w_partial';
    } else {
      return 'w_confirmed';
    }
  }

  private calculateOverallStatus(): string {
    // If ANY item has Required Qty !== Input Qty, then partial
    const hasPartial = this.orderedSet.some(item => 
      item.quantity !== item.availableQuantity
    );

    // If all items have Required Qty === Input Qty, then confirmed
    const allConfirmed = this.orderedSet.every(item => 
      item.quantity === item.availableQuantity
    ) && this.orderedSet.length > 0;

    if (hasPartial) {
      return 'partial_delivery';
    } else if (allConfirmed) {
      return 'wholesaler_confirmed';
    } else {
      return 'pending';
    }
  }

  // Bulk inventory update methods
  private prepareBulkInventoryUpdate(): any {
    const userProfile = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const wholesalerEmail = userProfile.email || '';

    const updates = this.orderedSet
      .filter(item => item.availableQuantity > 0 && item.inventoryId)
      .map(item => ({
        _id: item.inventoryId,
        quantity: item.availableQuantity,
        size: item.size,
        status: "remove",
        lastUpdatedBy: wholesalerEmail
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
      console.log('Bulk inventory update payload:', payload);
      const response = await this.authService.post('wholesaler-inventory/update-bulk', payload).toPromise();
      console.log('Inventory updated successfully:', response);
      return { success: true, message: 'Inventory updated successfully' };
    } catch (error) {
      console.error('Inventory update failed:', error);
      return { success: false, message: 'Inventory update failed' };
    }
  }

  // Main update method
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
      wholesalerNote: this.wholesalerNote,
      transportDetails: this.transportDetails,
      bankDetails: {
        accountHolderName: this.wholesalerProfile.companyName,
        accountNumber: this.bankDetails.accountNumber,
        bankName: this.bankDetails.bankName,
        branchName: this.bankDetails.branch,
        accountType: this.bankDetails.accountType,
        ifscCode: this.bankDetails.IFSCcode,
        swiftCode: this.bankDetails.swiftCode || '',
        upiId: this.bankDetails.upiId || '',
        bankAddress: `${this.bankDetails.city}, ${this.bankDetails.country}`
      },
    };

    console.log('Updating PO with data:', poUpdateData);

    // STEP 1: Update PO (CRITICAL - Must succeed or stop everything)
    this.authService.patchpimage(`po-retailer-to-wholesaler/update-po-data/${this.PoId}`, poUpdateData)
      .subscribe({
        next: async (poResponse) => {
          console.log('✅ PO updated successfully:', poResponse);

          let inventorySuccess = false;
          let inventoryMessage = '';

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

          // BUSINESS CONTINUITY SUCCESS MESSAGES
          this.showBusinessContinuityMessage(
            calculatedStatusAll,
            inventorySuccess
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
    inventorySuccess: boolean
  ) {
    const isFullyConfirmed = statusAll === 'wholesaler_confirmed';
    const isPartialDelivery = statusAll === 'partial_delivery';

    if (isFullyConfirmed) {
      if (inventorySuccess) {
        this.communicationService.customSuccess('Purchase Order confirmed and inventory updated successfully!');
      } else {
        alert('✅ Purchase Order confirmed.\n⚠️ Inventory sync failed - please update inventory manually.');
      }
    } else if (isPartialDelivery) {
      if (inventorySuccess) {
        alert('✅ Purchase Order updated with partial delivery and inventory updated!');
      } else {
        alert('✅ Purchase Order updated with partial delivery.\n⚠️ Inventory allocation failed - please update manually.');
      }
    } else {
      if (inventorySuccess) {
        alert('✅ Purchase Order updated and inventory updated!');
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