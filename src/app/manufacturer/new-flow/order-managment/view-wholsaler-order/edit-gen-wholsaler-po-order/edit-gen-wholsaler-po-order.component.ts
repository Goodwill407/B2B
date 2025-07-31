import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '@core';

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

interface PoItem {
  _id: string;
  clothing: string;
  gender: string;
  designNumber: string;
  colourName: string;
  size: string;
  totalQuantity: number;
  availableQuantity: number;
  inventoryQuantity: number;
}

interface PoResponse {
  wholesaler: Wholesaler;
  manufacturer: Manufacturer;
  statusAll: string;
  expDeliveryDate?: string;
  partialDeliveryDate?: string;
  wholesalerPODateCreated: string;
  poNumber: number;
  set: Array<{
    _id: string;
    designNumber: string;
    colourName: string;
    size: string;
    totalQuantity: number;
    clothing: string;
    gender: string;
  }>;
}

interface RawInventoryItem {
  designNumber: string;
  standardSize: string;
  colourName: string;
  quantity: number;
}

interface InventoryEntry {
  standardSize: string;
  colourName: string;
  quantity: number;
}
@Component({
  selector: 'app-edit-gen-wholsaler-po-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gen-wholsaler-po-order.component.html',
  styleUrls: ['./edit-gen-wholsaler-po-order.component.scss']
})
export class EditGenWholsalerPoOrderComponent implements OnInit {
  wholesalerCompany!: string;
  wholesalerEmail!: string;
  wholesalerMobile!: string;
  wholesalerGSTIN!: string;
  wholesalerPAN!: string;
  wholesalerLogo!: string;
  wholesalerAddress!: string;
  poNumber!: number;
  poDate!: Date;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  minDate!: string;
  orderedSet: PoItem[] = [];
  PoId!: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.PoId = this.route.snapshot.paramMap.get('id') || '';
    const today = new Date();
    this.minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.loadData();
  }

  private loadData() {
    this.authService
      .get(`po-wholesaler-to-manufacture/${this.PoId}`)
      .pipe(
        switchMap((rawPo: any) => {
          const po = rawPo as PoResponse;
          const designNumbers = Array.from(new Set(po.set.map(i => i.designNumber)));
          return forkJoin({
            po: of(po),
            inventoryRes: this.authService.post(
              'manufacture-inventory/by-designs',
              { designNumbers }
            )
          });
        })
      )
      .subscribe({
        next: ({ po, inventoryRes }: { po: PoResponse; inventoryRes: any }) => {
          const flatInv = (inventoryRes as { success: boolean; data: RawInventoryItem[] }).data;
          this.mapResponses(po, flatInv);
        },
        error: err => console.error('Load failed', err)
      });
  }

  private mapResponses(po: PoResponse, flatInventory: RawInventoryItem[]) {
    // 1) Group flatInventory by designNumber
    const inventoryMap = new Map<string, InventoryEntry[]>();
    for (const item of flatInventory) {
      if (!inventoryMap.has(item.designNumber)) {
        inventoryMap.set(item.designNumber, []);
      }
      inventoryMap.get(item.designNumber)!.push({
        standardSize: item.standardSize,
        colourName:   item.colourName,
        quantity:     item.quantity
      });
    }

    // 2) Header fields
    const w = po.wholesaler;
    this.wholesalerCompany  = w.companyName;
    this.wholesalerEmail    = w.email;
    this.wholesalerMobile   = w.mobNumber;
    this.wholesalerGSTIN    = w.GSTIN;
    this.wholesalerPAN      = w.GSTIN.substring(2, 12);
    this.wholesalerLogo     = w.profileImg;
    this.wholesalerAddress  = `${w.address}, ${w.pinCode} – ${w.state}`;
    this.poNumber           = po.poNumber;
    this.poDate             = new Date(po.wholesalerPODateCreated);
    this.expDeliveryDate    = po.expDeliveryDate    ? new Date(po.expDeliveryDate)    : null;
    this.partialDeliveryDate = po.partialDeliveryDate ? new Date(po.partialDeliveryDate) : null;

    // 3) Build table rows
    this.orderedSet = po.set.map(item => {
      const entries = inventoryMap.get(item.designNumber) || [];
      const match = entries.find(e =>
        e.colourName.toLowerCase() === item.colourName.toLowerCase() &&
        e.standardSize.toLowerCase() === item.size.toLowerCase()
      );
      const invQty     = match ? match.quantity : 0;
      const defaultQty = Math.min(item.totalQuantity, invQty);

      return {
        _id:               item._id,
        clothing:          item.clothing,
        gender:            item.gender,
        designNumber:      item.designNumber,
        colourName:        item.colourName,
        size:              item.size,
        totalQuantity:     item.totalQuantity,
        availableQuantity: defaultQty,
        inventoryQuantity: invQty
      };
    });
  }

  hasInvalidQuantities(): boolean {
    return this.orderedSet.some(i =>
      i.availableQuantity > i.totalQuantity ||
      i.availableQuantity > i.inventoryQuantity
    );
  }

  hasInvalidQuantitiesForItem(item: PoItem): boolean {
    return item.availableQuantity > item.totalQuantity ||
           item.availableQuantity > item.inventoryQuantity;
  }

  hasPartialDelivery(): boolean {
    return this.orderedSet.some(i => i.availableQuantity < i.totalQuantity);
  }

  clampAvailableQuantity(item: PoItem) {
    if (item.availableQuantity < 0) item.availableQuantity = 0;
    const max = Math.min(item.totalQuantity, item.inventoryQuantity);
    if (item.availableQuantity > max) item.availableQuantity = max;
  }

  preventInvalidInput(evt: KeyboardEvent) {
    if (['e', 'E', '+', '-', '.'].includes(evt.key)) evt.preventDefault();
  }

  navigateBack() {
    this.location.back();
  }

  updatePoData() {
    // implement your PATCH/POST here
  }
}