import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-po-quantity-update-from-mfg',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    BottomSideAdvertiseComponent,
    MatTabsModule
  ],
  templateUrl: './po-quantity-update-from-mfg.component.html',
  styleUrl: './po-quantity-update-from-mfg.component.scss'
})
export class PoQuantityUpdateFromMfgComponent {

 // -- Partial Delivery state
  partialData: any[] = [];
  totalPartialResults = 0;
  partialPage = 1;
  partialLimit = 10;
  partialFirst = 0;
  partialRows = 10;

  // -- Confirmed Delivery state
  confirmedData: any[] = [];
  totalConfirmedResults = 0;
  confirmedPage = 1;
  confirmedLimit = 10;
  confirmedFirst = 0;
  confirmedRows = 10;

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
    'assets/images/adv/ads.jpg'
  ];
 

  constructor(
    private route: ActivatedRoute,
    private authService:AuthService,
    private communicationService: CommunicationService
  ){}

   ngOnInit() {
    this.getPartialPoList();
    this.getConfirmedPoList();
  }

 private getPartialPoList() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?${this.authService.currentUserValue.email}` +
        `&statusAll=m_partial_delivery&page=${this.partialPage}&limit=${this.partialLimit}`
      )
      .subscribe((res: any) => {
        this.partialData = res.results;
        this.totalPartialResults = res.totalResults;
      });
  }

  private getConfirmedPoList() {
    this.authService
      .get(
        `/po-wholesaler-to-manufacture?${this.authService.currentUserValue.email}` +
        `&statusAll=m_order_confirmed&page=${this.confirmedPage}&limit=${this.confirmedLimit}`
      )
      .subscribe((res: any) => {
        this.confirmedData = res.results;
        this.totalConfirmedResults = res.totalResults;
      });
  }

  onPartialPageChange(event: any) {
    this.partialPage = event.page + 1;
    this.partialLimit = event.rows;
    this.partialFirst = event.first;
    this.getPartialPoList();
  }

  onConfirmedPageChange(event: any) {
    this.confirmedPage = event.page + 1;
    this.confirmedLimit = event.rows;
    this.confirmedFirst = event.first;
    this.getConfirmedPoList();
  }

}
