import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-view-updated-wholsaler-po-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-updated-wholsaler-po-order.component.html',
  styleUrl: './view-updated-wholsaler-po-order.component.scss'
})
export class ViewUpdatedWholsalerPoOrderComponent {

  wholesaler: any = {};
  poNumber: number | string = '';
  poDate: Date | null = null;
  expDeliveryDate: Date | null = null;
  partialDeliveryDate: Date | null = null;
  statusAll: string = '';
  orderedSet: any[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.isLoading = true;
    this.authService.get(`po-wholesaler-to-manufacture/${id}`).subscribe({
      next: (res: any) => {
        this.wholesaler = res.wholesaler || {};
        this.poNumber = res.poNumber;
        this.poDate = res.wholesalerPODateCreated ? new Date(res.wholesalerPODateCreated) : null;
        this.expDeliveryDate = res.expDeliveryDate ? new Date(res.expDeliveryDate) : null;
        this.partialDeliveryDate = res.partialDeliveryDate ? new Date(res.partialDeliveryDate) : null;
        this.statusAll = res.statusAll;

        this.orderedSet = (res.set || []).map((item: any, i: number) => ({
          ...item,
          srNo: i + 1
        }));

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  isPartialRow(item: any) {
    // Highlight if not fully supplied for partial delivery
    return this.statusAll === 'm_partial_delivery' && item.availableQuantity !== item.totalQuantity;
  }

  navigateBack() {
  this.location.back();
}
}
