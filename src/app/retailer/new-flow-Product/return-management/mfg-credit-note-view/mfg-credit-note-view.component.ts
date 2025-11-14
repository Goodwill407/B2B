import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-mfg-credit-note-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './mfg-credit-note-view.component.html',
  styleUrl: './mfg-credit-note-view.component.scss'
})
export class MfgCreditNoteViewComponent implements OnInit {

  creditNoteData: any = null;
  loading: boolean = false;
  creditNoteId: string = '';

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.creditNoteId = this.route.snapshot.params['id'];
    if (this.creditNoteId) {
      this.getCreditNoteDetails();
    }
  }

  getCreditNoteDetails() {
    this.loading = true;
    const url = `m-r-credit-note/${this.creditNoteId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.creditNoteData = res;
        this.loading = false;
        console.log('Credit Note Details:', this.creditNoteData);
      },
      (error) => {
        console.error('Error fetching credit note details:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load credit note details');
      }
    );
  }

  navigateBack() {
    this.location.back();
  }

  // Calculate item-wise amount (price * acceptedQuantity)
  getItemAmount(item: any): number {
    const price = parseFloat(item.price) || 0;
    const quantity = item.acceptedQuantity || 0;
    return price * quantity;
  }

  // Calculate item-wise amount with GST
  getItemAmountWithGST(item: any): number {
    const baseAmount = this.getItemAmount(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return baseAmount * (1 + gstRate);
  }

  // Get total return quantity
  getTotalReturnQuantity(): number {
    if (!this.creditNoteData?.set) return 0;
    return this.creditNoteData.set.reduce((total: number, item: any) => {
      return total + (item.returnQuantity || 0);
    }, 0);
  }

  // Get total accepted quantity
  getTotalAcceptedQuantity(): number {
    if (!this.creditNoteData?.set) return 0;
    return this.creditNoteData.set.reduce((total: number, item: any) => {
      return total + (item.acceptedQuantity || 0);
    }, 0);
  }

  // Calculate total taxable amount
  getTotalTaxableAmount(): number {
    if (!this.creditNoteData?.set) return 0;
    return this.creditNoteData.set.reduce((total: number, item: any) => {
      return total + this.getItemAmount(item);
    }, 0);
  }

  // Get status display
  getStatusDisplay(): string {
    return this.creditNoteData?.used ? 'Used' : 'Available';
  }

  // Get status class
  getStatusClass(): string {
    return this.creditNoteData?.used ? 'status-used' : 'status-available';
  }

  // Calculate item final amount after discount
getItemFinalAmount(item: any): number {
  const totalWithGST = this.getItemAmountWithGST(item);
  const discountPercent = Number(this.creditNoteData?.retailer?.productDiscount) || 0;
  const discountAmount = (totalWithGST * discountPercent) / 100;
  return totalWithGST - discountAmount;
}

// Calculate item discount amount
getItemDiscount(item: any): number {
  const totalWithGST = this.getItemAmountWithGST(item);
  const discountPercent = Number(this.creditNoteData?.retailer?.productDiscount) || 0;
  return (totalWithGST * discountPercent) / 100;
}

// Calculate total amount with GST
getTotalWithGST(): number {
  if (!this.creditNoteData?.set) return 0;
  return this.creditNoteData.set.reduce((total: number, item: any) => {
    return total + this.getItemAmountWithGST(item);
  }, 0);
}

// Calculate total final amount after discount
getTotalFinalAmount(): number {
  if (!this.creditNoteData?.set) return 0;
  return this.creditNoteData.set.reduce((total: number, item: any) => {
    return total + this.getItemFinalAmount(item);
  }, 0);
}

// Calculate total discount
getTotalDiscount(): number {
  if (!this.creditNoteData?.set) return 0;
  return this.creditNoteData.set.reduce((total: number, item: any) => {
    return total + this.getItemDiscount(item);
  }, 0);
}

  // Print credit note (commented out in HTML)
  // printCreditNote() {
  //   window.print();
  // }
}
