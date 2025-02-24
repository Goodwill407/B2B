import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

interface PriceHeaders {
  [designNumber: string]: {
    [size: string]: number;
  };
}

@Component({
  selector: 'app-view-retailor-man-order-req',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AccordionModule, TableModule, RouterModule
  ],
  templateUrl: './view-retailor-man-order-req.component.html',
  styleUrl: './view-retailor-man-order-req.component.scss'
})
export class ViewRetailorManOrderReqComponent implements OnInit {
  distributorId: string = '';
  userProfile: any;
  sizeHeaders: string[] = [];
  priceHeaders: PriceHeaders = {};
  groupedProducts: any[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();
  }

  /** Fetch Products from API */
  getAllProducts() {
    const url = `rtl-orderP-request/${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res.requestedItems) {
          this.processGroupedProducts(res.requestedItems);
        }
      },
      (error) => console.error("Error fetching products", error)
    );
  }

  /** Process & Group Products by Design Number */
  processGroupedProducts(requestedItems: any[]): void {
    const grouped: any = {};
    this.sizeHeaders = [...new Set(requestedItems.map(item => item.size))].sort();

    requestedItems.forEach((item) => {
      const key = item.designNumber;
      if (!grouped[key]) {
        grouped[key] = {
          designNumber: key,
          rows: []
        };
      }

      let row = grouped[key].rows.find((r: any) => r.colourName === item.colour);
      if (!row) {
        row = {
          colourName: item.colour,
          quantities: {},
          availableQuantities: {},
          totalPrice: 0
        };
        grouped[key].rows.push(row);
      }

      row.quantities[item.size] = item.orderedQuantity || 'N/A';
      row.availableQuantities[item.size] = item.availableQuantity || 'N/A';
      row.totalPrice += (item.availableQuantity || 0) * (this.priceHeaders[key]?.[item.size] || 0);
    });

    this.groupedProducts = Object.values(grouped);
  }
}
