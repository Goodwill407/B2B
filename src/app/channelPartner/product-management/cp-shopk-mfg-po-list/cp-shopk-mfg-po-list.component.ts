import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface POItem {
  _id: string;
  id:string;
  poNumber: number;
  cartId: string;
  cpEmail: string;
  shopKeeperEmail: string;
  manufacturerEmail: string;
  manufacturer: { fullName?: string; companyName?: string; email?: string };
  shopkeeper: { fullName?: string; shopName?: string; email?: string };
  totalQty: number;
  totalAmount: number;
  finalAmount: number;
  discount: number;
  statusAll: string;
  poDate: string;
  createdAt: string;
  isInvoiceGenerated: boolean;
}

@Component({
  selector: 'app-cp-shopk-mfg-po-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, TagModule],
  templateUrl: './cp-shopk-mfg-po-list.component.html',
  styleUrl: './cp-shopk-mfg-po-list.component.scss'
})
export class CpShopkMfgPoListComponent implements OnInit {

  pos: POItem[] = [];
  filteredPos: POItem[] = [];
  loading = false;
  currentUser: any;

  // ── Filters ───────────────────────────────────
  searchTerm = '';
  selectedStatus = '';
  selectedManufacturer = '';
  manufacturerOptions: string[] = [];

  // ── Pagination ────────────────────────────────
  page = 1;
  limit = 10;
  totalPages = 1;
  totalResults = 0;

  readonly statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Pending',    value: 'pending' },
    { label: 'Accepted',   value: 'accepted' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped',    value: 'shipped' },
    { label: 'Delivered',  value: 'delivered' },
    { label: 'Rejected',   value: 'rejected' },
    { label: 'Cancelled',  value: 'cancelled' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.getPoList();
  }

  getPoList(): void {
  this.loading = true;
  let url = `po-cp-to-manufacture/list/all?page=${this.page}&limit=${this.limit}&cpEmail=${this.currentUser?.email || ''}`;
  if (this.selectedStatus)       url += `&statusAll=${this.selectedStatus}`;
  if (this.selectedManufacturer) url += `&manufacturerEmail=${this.selectedManufacturer}`;

  this.authService.get(url).subscribe({
    next: (res: any) => {
      const docs = res?.docs || res?.data || res?.results || [];
      this.pos          = Array.isArray(docs) ? docs : [];
      this.filteredPos  = [...this.pos];
      this.totalPages   = res?.totalPages || 1;
      this.totalResults = res?.totalResults || this.pos.length;  // ← fixed

      const emails = new Set<string>();
      this.pos.forEach((p: POItem) => { if (p.manufacturerEmail) emails.add(p.manufacturerEmail); });
      this.manufacturerOptions = Array.from(emails);

      this.applySearch();
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.communicationService.customError1('Unable to load PO list');
    }
  });
}

  applySearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPos = this.pos.filter(po => {
      const mfgName  = (po.manufacturer?.companyName || po.manufacturer?.fullName || po.manufacturerEmail || '').toLowerCase();
      const shopName = (po.shopkeeper?.shopName || po.shopkeeper?.fullName || po.shopKeeperEmail || '').toLowerCase();
      const poNum    = String(po.poNumber).toLowerCase();
      return !term || mfgName.includes(term) || shopName.includes(term) || poNum.includes(term);
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.getPoList();
  }

  onPageChange(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.getPoList();
  }

  viewPO(po: POItem): void {
    this.router.navigate(['/cp/cp-shopk-mfg-view-po'], {
      queryParams: { poId: po._id || po.id }
    });
  }

  getStatusSeverity(status: string): string {
    const map: any = {
      pending:    'warning',
      accepted:   'success',
      processing: 'info',
      shipped:    'info',
      delivered:  'success',
      rejected:   'danger',
      cancelled:  'danger',
      partial:    'warning',
    };
    return map[status] || 'secondary';
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending:    'badge-pending',
      accepted:   'badge-accepted',
      processing: 'badge-processing',
      shipped:    'badge-shipped',
      delivered:  'badge-delivered',
      rejected:   'badge-rejected',
      cancelled:  'badge-cancelled',
    };
    return map[status] || 'badge-default';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  navigateFun(): void {
    this.location.back();
  }
}
