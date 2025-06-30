import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AuthService } from '@core';
import { IndianCurrencyPipe } from 'app/custom.pipe';

@Component({
  selector: 'app-view-quantity-updaed-po-of-mfg',
  standalone: true,
  imports: [CommonModule, TableModule, IndianCurrencyPipe],
  templateUrl: './view-quantity-updaed-po-of-mfg.component.html',
  styleUrl: './view-quantity-updaed-po-of-mfg.component.scss'
})
export class ViewQuantityUpdaedPoOfMfgComponent implements OnInit {
   purchaseOrder: any;
  tableChunks: any[][] = [];
  serialOffset: number[] = [];

  makeToOrderSet: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.authService
      .get(`/po-wholesaler-to-manufacture/${id}`)
      .subscribe((res: any) => {
        // map fields for your template
        res.poDate     = res.wholesalerPODateCreated;
        res.buyerName  = res.wholesaler.fullName;
        res.buyerAddr  = res.wholesaler.address;
        res.buyerPhone = res.wholesaler.mobNumber;
        res.buyerEmail = res.wholesaler.email;
        res.buyerGSTIN = res.wholesaler.GSTIN;

        res.supplierName    = res.manufacturer.fullName;
        res.supplierAddr    = res.manufacturer.address;
        res.supplierPhone   = res.manufacturer.mobNumber;
        res.supplierEmail   = res.manufacturer.email;
        res.supplierGSTIN   = res.manufacturer.GSTIN;

        this.purchaseOrder = res;
  //       this.setupTable(res.set || []);
        // this.purchaseOrder = res;

        this.makeToOrderSet = this.purchaseOrder.set.filter((item: { status: any; }) => item.status === 'm_partial_delivery').map((item: { _id: any; designNumber: any; colour: any; colourName: any; size: any; totalQuantity: number; availableQuantity: number; price: any; manufacturerPrice: any; productType: any; gender: any; clothing: any; subCategory: any; }) => ({
          availableQuantity:    0,                                    // always zero when we “make to order”
          confirmed:            false,
          status:               'pending',
          // _id:                  item._id,                            // re-use original ID (or generate new if you prefer)
          designNumber:         item.designNumber,
          colour:               item.colour,
          colourName:           item.colourName,
          size:                 item.size,
          quantity:             item.totalQuantity - item.availableQuantity,
          price:                item.price,
          manufacturerPrice:    item.manufacturerPrice,
          colourImage:          (item as any).colourImage || '',      // ⚠️ GAP: API doesn’t include colourImage—you’ll need to add this in the response or look it up separately
          productType:          item.productType,
          gender:               item.gender,
          clothing:             item.clothing,
          subCategory:          item.subCategory,
          productBy:            this.purchaseOrder.manufacturerEmail  // from your payload
        }));

      });
  }

  // private setupTable(items: any[]): void {
  //   const chunkSize = 10;
  //   for (let i = 0; i < items.length; i += chunkSize) {
  //     this.tableChunks.push(items.slice(i, i + chunkSize));
  //     this.serialOffset.push(i);
  //   }
  // }

//   removeMakeToOrderItem(index: number): void {
//   this.makeToOrderSet.splice(index, 1);
// }

  removeMakeToOrderItemByItem(item: any): void {
  const idx = this.makeToOrderSet.indexOf(item);
  if (idx > -1) {
    this.makeToOrderSet.splice(idx, 1);
  }
}

  printPO(): void {
    window.print();
  }

  navigateFun(): void {
    history.back();
  }

  confirmPO(){}

  deletePO(){}
}