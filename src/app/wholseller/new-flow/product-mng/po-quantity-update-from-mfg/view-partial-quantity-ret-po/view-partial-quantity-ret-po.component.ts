// Allocation of quantities

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@core';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { MatTabsModule } from '@angular/material/tabs';

interface RetailerLink {
  _id: string;
  poId: string;
  setItemId: string;
  quantity: number;
}

interface SetItem {
  _id: string;
  designNumber: string;
  colourName: string;
  size: string;
  totalQuantity: number;
  availableQuantity: number;
  price: string;
  status: string;
  subCategory: string;
  productType: string;
  retailerPoLinks: RetailerLink[];
}

interface PoResponse {
  wholesalerPODateCreated: string;
  manufacturer: any;
  wholesaler: any;
  poNumber: number;
  expDeliveryDate: string;
  partialDeliveryDate: string;
  set: SetItem[];
  createdFromRetailerPoIds: string[];
  // Mapped for template
  poDate?: string;
  buyerName?: string;
  buyerAddr?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerGSTIN?: string;
  supplierName?: string;
  supplierAddr?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierGSTIN?: string;
}

interface AllocationLine {
  setItemId: string;
  designNumber: string;
  size: string;
  demanded: number;
  allocated: number;
}

interface PoAllocation {
  items: AllocationLine[];
  totalDemand: number;
  totalAllocated: number;
  fullySatisfied: boolean;
}

@Component({
  selector: 'app-view-partial-quantity-ret-po',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, IndianCurrencyPipe, MatTabsModule],
  templateUrl: './view-partial-quantity-ret-po.component.html',
  styleUrls: ['./view-partial-quantity-ret-po.component.scss']
})
export class ViewPartialQuantityRetPoComponent implements OnInit {
  purchaseOrder!: PoResponse;
  makeToOrderSet: any[] = [];
  allocations: { [poId: string]: PoAllocation } = {};
  expandedRows: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.authService.get(`/po-wholesaler-to-manufacture/${id}`)
      .subscribe((res: any) => {
        // Map backend fields to template props
        res.poDate     = res.wholesalerPODateCreated;
        res.buyerName  = res.wholesaler.fullName;
        res.buyerAddr  = res.wholesaler.address;
        res.buyerPhone = res.wholesaler.mobNumber;
        res.buyerEmail = res.wholesaler.email;
        res.buyerGSTIN = res.wholesaler.GSTIN;

        res.supplierName  = res.manufacturer.fullName;
        res.supplierAddr  = res.manufacturer.address;
        res.supplierPhone = res.manufacturer.mobNumber;
        res.supplierEmail = res.manufacturer.email;
        res.supplierGSTIN = res.manufacturer.GSTIN;

        this.purchaseOrder = res;

        // Build Make-To-Order list
        this.makeToOrderSet = this.purchaseOrder.set
          .filter(item => item.status === 'm_partial_delivery')
          .map(item => ({
            ...item,
            quantity: item.totalQuantity - item.availableQuantity
          }));

        // Allocate across retailer POs
        this.allocateToRetailerPOs();
      });
  }

  private allocateToRetailerPOs(): void {
    const poIds = this.purchaseOrder.createdFromRetailerPoIds;
    // Initialize allocations
    poIds.forEach(id => {
      this.allocations[id] = {
        items: [],
        totalDemand: 0,
        totalAllocated: 0,
        fullySatisfied: false
      };
    });

    // Distribute each line's availableQuantity
    this.purchaseOrder.set.forEach(item => {
      let remaining = item.availableQuantity;
      poIds.forEach(poId => {
        const link = item.retailerPoLinks.find(l => l.poId === poId);
        if (!link) return;

        const demand = link.quantity;
        this.allocations[poId].totalDemand += demand;
        const give = Math.min(demand, remaining);
        this.allocations[poId].totalAllocated += give;
        remaining -= give;

        this.allocations[poId].items.push({
          setItemId: item._id,
          designNumber: item.designNumber,
          size: item.size,
          demanded: demand,
          allocated: give
        });
      });
    });

    // Mark satisfaction
    Object.values(this.allocations).forEach(a => {
      a.fullySatisfied = a.totalAllocated >= a.totalDemand;
    });
  }

  toggleRow(item: SetItem): void {
    this.expandedRows[item._id] = !this.expandedRows[item._id];
  }

  navigateFun(): void {
    history.back();
  }

  removeMakeToOrderItemByItem(item: any): void {
    const idx = this.makeToOrderSet.indexOf(item);
    if (idx > -1) this.makeToOrderSet.splice(idx, 1);
  }

  confirmPO(): void {
    // TODO: implement confirmation logic
  }

  deletePO(): void {
    // TODO: implement cancellation logic
  }

  // tracks which PO summaries are expanded
expandedAllocations: { [poId: string]: boolean } = {};

toggleAllocation(poId: string) {
  this.expandedAllocations[poId] = !this.expandedAllocations[poId];
}

removeAllocation(poId: string, line: AllocationLine) {
  // your logic here: e.g. adjust allocated quantity or remove line
}
}
