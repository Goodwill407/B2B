import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, CommunicationService } from '@core';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface VendorDetails {
  vendorName: string;
  companyName: string;
  contactPersonName: string;
  vendorEmail: string;
  contactNumber: string;
}

interface WarehouseDetails {
  warehouseName: string;
  code: string;
  contactPersonName: string;
  contactNumber: string;
  email: string;
}

interface MaterialBOM {
  materialName: string;
  materialCode: string;
  requiredQtyPerPiece: number;
  availableStock: number;
  possibleQuantity: number;
  status: string;
  vendorDetails?: VendorDetails;
  warehouseDetails?: WarehouseDetails;
}

interface PoItem {
  _id: string;
  clothing: string;
  gender: string;
  designNumber: string;
  colourName: string;
  colour?: string;
  colourImage: string;
  size: string;
  quantity: number;             // ✅ renamed from totalQuantity — matches API field
  availableQuantity: number;    // Dispatch Qty (input)
  inventoryQuantity: number;    // Current Stock
  minimumQuantityAlert: number;
  price: string;
  hsnCode: string;
  hsnGst: number;
  status: string;
  productId?: string;
  inventoryId?: string;
  confirmed: boolean;
  rejected: boolean;
  productType: string;
  brandName: any;
  producibleQuantity?: number;
  bomDetails?: MaterialBOM[];
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

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-edit-gen-wholsaler-po-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gen-wholsaler-po-order.component.html',
  styleUrls: ['./edit-gen-wholsaler-po-order.component.scss']
})
export class EditGenWholsalerPoOrderComponent implements OnInit {

  // Wholesaler display fields
  wholesalerCompany!: string;
  wholesalerEmail!: string;
  wholesalerMobile!: string;
  wholesalerGSTIN!: string;
  wholesalerPAN!: string;
  wholesalerLogo!: string;
  wholesalerAddress!: string;

  // Manufacturer profile
  manufacturerProfile!: ManufacturerProfile;

  // Order fields
  poNumber!: number;
  poDate!: Date;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  minDate!: string;
  orderedSet: PoItem[] = [];
  PoId!: string;

  // Transport & Bank
  transportDetails!: TransportDetails;
  bankDetails!: BankDetails;

  // Status
  currentStatusAll: string = 'pending';
  manufacturerNote: string = '';

  // BOM Modal
  showBomModal: boolean = false;
  selectedBomItem: PoItem | null = null;

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

  // ─── Data Loading ────────────────────────────────────────────────────────────

  private loadData() {
    this.authService
      .get(`po-wholesaler-to-manufacture/${this.PoId}`)
      .pipe(
        switchMap((rawPo: any) => {
          const designNumbers = Array.from(
            new Set(rawPo.set.map((i: any) => i.designNumber))
          );
          const manufacturerEmail = rawPo.manufacturerEmail;

          return forkJoin({
            po: of(rawPo),
            inventoryRes: this.authService.post(
              'manufacture-inventory/by-designs',
              { designNumbers }
            ),
            manufacturerProfile: this.authService.get(
              `manufacturers/${manufacturerEmail}`
            )
          });
        })
      )
      .subscribe({
        next: ({ po, inventoryRes, manufacturerProfile }) => {
          const flatInv = (inventoryRes as any)?.data || [];
          this.mapResponses(po, flatInv, manufacturerProfile);
        },
        error: err => console.error('Load failed', err)
      });
  }

  private mapResponses(po: any, flatInventory: any[], manufacturerProfile: any) {
    // 1) Build inventory map
    const inventoryMap = new Map<string, any[]>();
    for (const item of flatInventory) {
      if (!inventoryMap.has(item.designNumber)) {
        inventoryMap.set(item.designNumber, []);
      }
      inventoryMap.get(item.designNumber)!.push({
        standardSize:         item.standardSize,
        colourName:           item.colourName,
        quantity:             item.quantity,
        minimumQuantityAlert: item.minimumQuantityAlert || 0,
        productId:            item.productId || '',
        inventoryId:          item.id || item._id || '',
        brandName:            item.brandName || ''
      });
    }

    // 2) Wholesaler header fields
    const w = po.wholesaler;
    this.wholesalerCompany  = w.companyName;
    this.wholesalerEmail    = w.email;
    this.wholesalerMobile   = w.mobNumber;
    this.wholesalerGSTIN    = w.GSTIN;
    this.wholesalerPAN      = w.GSTIN ? w.GSTIN.substring(2, 12) : '';
    this.wholesalerLogo     = w.profileImg || w.logo || '';  // ✅ profileImg first (matches API)
    this.wholesalerAddress  = `${w.address}, ${w.pinCode} – ${w.state}`;

    // 3) Manufacturer profile & bank
    this.manufacturerProfile = manufacturerProfile;
    this.bankDetails         = manufacturerProfile.BankDetails;

    // 4) Order metadata
    this.poNumber            = po.poNumber;
    this.poDate              = new Date(po.wholesalerPODateCreated);
    this.currentStatusAll    = po.statusAll;
    this.transportDetails    = po.transportDetails || {};
    this.manufacturerNote    = po.manufacturerNote || '';
    this.expDeliveryDate     = po.expDeliveryDate     ? new Date(po.expDeliveryDate)     : null;
    this.partialDeliveryDate = po.partialDeliveryDate ? new Date(po.partialDeliveryDate) : null;

    // 5) Build table rows
    this.orderedSet = po.set.map((item: any) => {
      const entries = inventoryMap.get(item.designNumber) || [];
      const match   = entries.find((e: any) =>
        e.colourName.toLowerCase()   === item.colourName.toLowerCase() &&
        e.standardSize.toLowerCase() === item.size.toLowerCase()
      );

      const invQty   = match ? match.quantity : 0;
      const minAlert = match ? match.minimumQuantityAlert : 0;

      // ✅ Respect previously saved availableQuantity (same as ref component)
      const defaultQty = item.availableQuantity || Math.min(item.quantity, invQty);

      return {
        _id:                  item._id,
        clothing:             item.clothing,
        gender:               item.gender,
        designNumber:         item.designNumber,
        colourName:           item.colourName,
        colour:               item.colour,
        colourImage:          item.colourImage || '',
        size:                 item.size,
        quantity:             item.quantity,        // ✅ FIX: was item.totalQuantity — API uses `quantity`
        availableQuantity:    defaultQty,           // ✅ respects saved value
        inventoryQuantity:    invQty,
        minimumQuantityAlert: minAlert,
        price:                item.price || '0',
        hsnCode:              item.hsnCode || '',
        hsnGst:               item.hsnGst  || 0,
        status:               item.status,
        productId:            match ? match.productId   : '',
        inventoryId:          match ? match.inventoryId : '',
        confirmed:            item.confirmed || false,
        rejected:             item.rejected  || false,
        productType:          item.productType || '',
        brandName:            match ? match.brandName : ''
      } as PoItem;
    });

    // 6) Fetch production capacity for mismatched items
    this.orderedSet.forEach(item => {
      if (this.hasQuantityMismatch(item)) {
        this.fetchProductionCapacity(item);
      }
    });
  }

  // ─── Validation ──────────────────────────────────────────────────────────────

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

  hasQuantityMismatch(item: PoItem): boolean {
    return item.quantity !== item.availableQuantity;
  }

  isLowStock(item: PoItem): boolean {
    return item.inventoryQuantity < item.minimumQuantityAlert && item.inventoryQuantity > 0;
  }

  isOutOfStock(item: PoItem): boolean {
    return item.inventoryQuantity === 0;
  }

  clampAvailableQuantity(item: PoItem) {
    if (item.availableQuantity < 0) item.availableQuantity = 0;
    const max = Math.min(item.quantity, item.inventoryQuantity);
    if (item.availableQuantity > max) item.availableQuantity = max;
    this.checkAndFetchCapacity(item);
  }

  preventInvalidInput(evt: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(evt.key)) evt.preventDefault();
  }

  // ─── Status Calculation ───────────────────────────────────────────────────────

  private calculateItemStatus(item: PoItem): string {
    return item.quantity !== item.availableQuantity
      ? 'm_partial_delivery'
      : 'm_confirmed';
  }

  private calculateOverallStatus(): string {
    const hasPartial   = this.orderedSet.some(i => i.quantity !== i.availableQuantity);
    const allConfirmed = this.orderedSet.every(i => i.quantity === i.availableQuantity)
                         && this.orderedSet.length > 0;

    if (hasPartial)   return 'm_partial_delivery';
    if (allConfirmed) return 'm_order_confirmed';
    return 'pending';
  }

  // ─── Inventory Update ─────────────────────────────────────────────────────────

  private prepareBulkInventoryUpdate(): any {
    const userProfile       = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const manufacturerEmail = userProfile.email || '';

    const updates = this.orderedSet
      .filter(item => item.availableQuantity > 0 && item.inventoryId)
      .map(item => ({
        _id:           item.inventoryId,
        quantity:      item.availableQuantity,
        status:        'remove',
        lastUpdatedBy: manufacturerEmail
      }));

    return { updates };
  }

  private async updateBulkInventory(): Promise<{ success: boolean; message: string }> {
    const payload = this.prepareBulkInventoryUpdate();

    if (payload.updates.length === 0) {
      return { success: false, message: 'No valid inventory records found for update' };
    }

    try {
      await this.authService.post('manufacture-inventory/update-bulk', payload).toPromise();
      return { success: true, message: 'Inventory updated successfully' };
    } catch (error) {
      console.error('Inventory update failed:', error);
      return { success: false, message: 'Inventory update failed' };
    }
  }

  // ─── Main Update ──────────────────────────────────────────────────────────────

  updatePoData() {
    if (this.hasInvalidQuantities()) {
      alert('Please fix invalid quantities before updating');
      return;
    }

    const updatedItems = this.orderedSet.map(item => ({
      _id:               item._id,
      availableQuantity: item.availableQuantity,
      confirmed:         item.availableQuantity > 0,
      rejected:          false,
      status:            this.calculateItemStatus(item)
    }));

    const calculatedStatusAll = this.calculateOverallStatus();

    const poUpdateData = {
      set:                 updatedItems,
      statusAll:           calculatedStatusAll,
      expDeliveryDate:     this.expDeliveryDate,
      partialDeliveryDate: this.partialDeliveryDate,
      manufacturerNote:    this.manufacturerNote,
      transportDetails:    this.transportDetails,
      bankDetails: {
        accountHolderName: this.manufacturerProfile.companyName,
        accountNumber:     this.bankDetails.accountNumber,
        bankName:          this.bankDetails.bankName,
        branchName:        this.bankDetails.branch,
        accountType:       this.bankDetails.accountType,
        ifscCode:          this.bankDetails.IFSCcode,
        swiftCode:         this.bankDetails.swiftCode,
        upiId:             this.bankDetails.upiId || '',
        bankAddress:       `${this.bankDetails.city}, ${this.bankDetails.country}`
      }
    };

    this.authService
      .patchpimage(`po-wholesaler-to-manufacture/update-po-data/${this.PoId}`, poUpdateData)
      .subscribe({
        next: async () => {
          let inventorySuccess = false;
          try {
            const result = await this.updateBulkInventory();
            inventorySuccess = result.success;
          } catch {
            inventorySuccess = false;
          }
          this.showBusinessContinuityMessage(calculatedStatusAll, inventorySuccess);
          this.navigateBack();
        },
        error: () => {
          alert('❌ Failed to update Purchase Order. No changes were made.');
        }
      });
  }

  private showBusinessContinuityMessage(statusAll: string, inventorySuccess: boolean) {
    const isConfirmed = statusAll === 'm_order_confirmed';
    const isPartial   = statusAll === 'm_partial_delivery';

    if (isConfirmed) {
      inventorySuccess
        ? this.communicationService.customSuccess('Purchase Order confirmed and inventory updated successfully!')
        : alert('✅ Purchase Order confirmed.\n⚠️ Inventory sync failed - please update inventory manually.');
    } else if (isPartial) {
      inventorySuccess
        ? alert('✅ Purchase Order updated with partial delivery and inventory updated!')
        : alert('✅ Purchase Order updated with partial delivery.\n⚠️ Inventory allocation failed - please update manually.');
    } else {
      inventorySuccess
        ? alert('✅ Purchase Order updated and inventory updated!')
        : alert('✅ Purchase Order updated.\n⚠️ Inventory allocation failed - please update manually.');
    }
  }

  // ─── Production Capacity / BOM ───────────────────────────────────────────────

  fetchProductionCapacity(item: PoItem) {
    const payload = {
      manufacturerEmail: this.manufacturerProfile?.email || '',
      designNumber:      item.designNumber,
      color:             item.colourName,
      size:              item.size
    };

    this.authService
      .post('manufacture-raw-material-inventory-logs/production-capacity', payload)
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data) {
            item.producibleQuantity = res.data.producibleQuantity;
            item.bomDetails         = res.data.materials;
          }
        },
        error: () => { item.producibleQuantity = undefined; }
      });
  }

  checkAndFetchCapacity(item: PoItem) {
    if (this.hasQuantityMismatch(item)) {
      this.fetchProductionCapacity(item);
    }
  }

  openBomModal(item: PoItem) {
    this.selectedBomItem         = item;
    this.showBomModal            = true;
    document.body.style.overflow = 'hidden';
  }

  closeBomModal() {
    this.showBomModal            = false;
    this.selectedBomItem         = null;
    document.body.style.overflow = 'auto';
  }

  navigateBack() {
    this.location.back();
  }
}
