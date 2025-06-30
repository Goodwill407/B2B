import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';

@Component({
  selector: 'app-edit-gen-wholsaler-po-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gen-wholsaler-po-order.component.html',
  styleUrl: './edit-gen-wholsaler-po-order.component.scss'
})
export class EditGenWholsalerPoOrderComponent {

  // — Header / meta fields —
wholesalerCompany!: string;
wholesalerEmail!: string;
wholesalerMobile!: string;
wholesalerGSTIN!: string;
wholesalerPAN!: string;
wholesalerLogo!: string;
wholesalerAddress: any;
poNumber!: number;
poDate!: Date;
isEditable = true;

expDeliveryDate: Date | null = null;
partialDeliveryDate: Date | null = null;

minDate!: string;

// — Table rows —
orderedSet: Array<{
  _id: any, 
  srNo: number;
  designNumber: string;
  colourName: string;
  gender: string;
  clothing: string;
  size: string;
  requiredQuantity: number;
  availableQuantity: number;
}> = [];

  PoId: any;
  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(){

     const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;

    this.PoId = this.route.snapshot.paramMap.get('id') || '';
    this.loadPoQtyData();
  }

  loadPoQtyData(){
    this.authService.get(`po-wholesaler-to-manufacture/${this.PoId}`).subscribe((res:any) => {
      // 1) Header / meta data
      const w = res.wholesaler;
      this.wholesalerCompany = w.companyName;
      this.wholesalerEmail   = w.email;
      this.wholesalerMobile  = w.mobNumber;
      this.wholesalerGSTIN   = w.GSTIN;
      // PAN is the 3rd–12th chars of GSTIN
      this.wholesalerPAN     = w.GSTIN?.substring(2, 12) ?? '';
      this.wholesalerLogo    = w.profileImg;
      this.wholesalerAddress = `${w.address}, ${w.pinCode} – ${w.state}`;

        this.expDeliveryDate = res.expDeliveryDate
        ? new Date(res.expDeliveryDate)
        : null;
      this.partialDeliveryDate = res.partialDeliveryDate
        ? new Date(res.partialDeliveryDate)
        : null;

      this.poNumber = res.poNumber;
      this.poDate   = new Date(res.wholesalerPODateCreated);

      this.isEditable = res.statusAll === 'pending'; 

      // 2) Build table rows (ignore retailerPoLinks)
      this.orderedSet = res.set.map((item:any, i:any) => ({
         _id:item._id, 
        srNo: i + 1,
        designNumber: item.designNumber,
        colourName: item.colourName,
        gender: item.gender,
        clothing: item.clothing,
        size: item.size,
         requiredQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity > 0 ? item.availableQuantity : item.totalQuantity
      }));

    });
}

/** Ensure availableQuantity ∈ [0, requiredQuantity] */
  onAvailableQuantityChange(item: {
    requiredQuantity: number;
    availableQuantity: number;
  }) {
    if (item.availableQuantity < 0) {
      item.availableQuantity = 0;
    }
  }

  preventInvalidInput(evt: KeyboardEvent) {
    // disallow “e”, “+”, “-”, “.” so only integers ≥ 0
    if (['e','E','+','-','.'].includes(evt.key)) {
      evt.preventDefault();
    }
  }

 // add a new blur handler to clamp the value back into range
clampAvailableQuantity(item: any) {
  if (item.availableQuantity < 0) {
    item.availableQuantity = 0;
  } else if (item.availableQuantity > item.requiredQuantity) {
    item.availableQuantity = item.requiredQuantity;
  }
}

hasInvalidQuantities(): boolean {
  return this.orderedSet.some(item =>
    item.availableQuantity > item.requiredQuantity
  );
}

  /** show second input only when any availableQuantity < requiredQuantity */
  hasPartialDelivery(): boolean {
    return this.orderedSet.some(
      item => item.availableQuantity < item.requiredQuantity
    );
  }


navigateFun(){
  this.location.back();
}

updatePoData() {
  // 1) Determine overall statusAll
  const allEqual = this.orderedSet.every(
    item => item.availableQuantity === item.requiredQuantity
  );
  const payload = {
    id:this.PoId,
    statusAll: allEqual ? 'm_order_confirmed' : 'm_partial_delivery',

    expDeliveryDate: this.expDeliveryDate,
    partialDeliveryDate: this.hasPartialDelivery()
      ? this.partialDeliveryDate
      : null,

    // statusAll: 'm_order_updated' ,
    set: this.orderedSet.map(item => ({
      _id:item._id,
      availableQuantity: item.availableQuantity,
      status:           item.availableQuantity === item.requiredQuantity
                        ? 'm_confirmed'
                        : 'm_partial_delivery'
    }))
  };

  // console.log(payload);
  // 2) PATCH to your endpoint
  this.authService
    .patch('po-wholesaler-to-manufacture/update-po-data', payload)
    .subscribe({
      next: (res) => {
        // handle success (e.g., show a toast, navigate back)
        console.log('PO updated', res);
        this.location.back();
      },
      error: (err) => {
        // handle error (e.g., show error toast)
        console.error('Update failed', err);
      }
    });
}

patchtemp(){

   const payload = {
    id:this.PoId,
    statusAll: 'pending'
   }
  this.authService
    .patch('po-wholesaler-to-manufacture/update-po-data', payload)
    .subscribe({
      next: (res) => {
        // handle success (e.g., show a toast, navigate back)
        console.log('PO updated', res);
        this.location.back();
      },
      error: (err) => {
        // handle error (e.g., show error toast)
        console.error('Update failed', err);
      }
    });
}

}
