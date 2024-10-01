import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-wls-list-po',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgStyle,
    RouterModule,
    TableModule,
    AccordionModule,
    DatePipe
  ],
  templateUrl: './wls-list-po.component.html',
  styleUrl: './wls-list-po.component.scss'
})
export class WlsListPoComponent {

  products: any[] = [];
  userProfile: any;
  transportTypes: any = ['By Air', 'By Ship', 'By Road', 'By Courier'];
  courierCompanies: any = ['FedEx', 'Delhivery', 'BlueDart', 'DHL', 'Shadowfax', 'Aramex Logistics Services', 'India Post', 'DTDC Courier'];

  constructor(public authService: AuthService, private router: Router, private communicationService: CommunicationService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.userProfile.email);
    this.getCouriersCompany();
    // this.postCourierCompany({name:'FedEx'})
  }

  getAllProducts(email: string) {
    const url = `product-order/get-product-order/by-supplyer?supplierEmail=${email}`;
    this.authService.get(url).subscribe((res: any) => {
      if (res) {
        this.products = res;
        this.products.forEach(distributor => {
          distributor.products.forEach((product: any) => {
            product.deliveryQty = product.qty;
            product.transportType = '';
            product.ebill = '';
            product.transportCompany = '';
            product.lorryReceiptNo = '';
            product.vehicleNo = '';
            product.receiptNo = '';
            product.courierCompany = '';
            product.otherCompanyName = '';
            product.trackingNo = '';
          });
          this.updateTotals(distributor);
        });
      }
    }, error => {
      this.communicationService.customError(error.error.message);
    });
  }

  getCouriersCompany() {
    this.authService.get('courier').subscribe((data) => {
      this.courierCompanies = data.results;
    })
  }

  postCourierCompany(data: any) {
    this.authService.post('courier', data).subscribe((data) => {
      console.log(data);
    })
  }

  updateDeliveryQuantity(event: any, distributor: any, product: any): void {
    const deliveryQuantity = event.target.value;
    product.deliveryQty = deliveryQuantity;
    this.updateTotals(distributor);
    this.cd.detectChanges();
  }

  updateTotals(distributor: any): void {
    distributor.subTotal = distributor.products.reduce((sum: number, product: any) => sum + (product.deliveryQty * product.rate), 0);
    // Check if discount is defined and is an array
    if (Array.isArray(distributor.discounts) && distributor.discounts.length > 0) {
      const discountPercentage = Number(distributor.discounts[0].productDiscount.replace('%', '')) / 100;
      distributor.discount = (distributor.subTotal * discountPercentage).toFixed(2);
    } else {
      distributor.discount = 0;
    }

    distributor.gst = Number((distributor.subTotal * 0.18).toFixed(2));
    distributor.grandTotal = (distributor.subTotal - distributor.discount) + Number(distributor.gst);
  }

  onTransportTypeChange(distributor: any): void {
    // Reset dependent fields when transport type changes
    distributor.transportCompany = '';
    distributor.lorryReceiptNo = '';
    distributor.vehicleNo = '';
    distributor.receiptNo = '';
    distributor.courierCompany = '';
    distributor.otherCompanyName = '';
  }

  validateShippingDetails(distributor: any): boolean {
    let isValid = true;

    if (!distributor.transportType) {
      isValid = false;
      this.communicationService.showNotification('snackbar-dark', 'Please select a transport type.', 'bottom', 'center')
    } else if (distributor.transportType === 'By Road') {
      if (!distributor.transportCompany || !distributor.lorryReceiptNo || !distributor.vehicleNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "By Road".', 'bottom', 'center')
      }
    } else if (distributor.transportType === 'By Air' || distributor.transportType === 'By Ship') {
      if (!distributor.transportCompany || !distributor.receiptNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "Company " or "Receipt No".', 'bottom', 'center')
      }
    } else if (distributor.transportType === 'By Courier') {
      if (!distributor.courierCompany || (!distributor.otherCompanyName && distributor.courierCompany === 'Other') || !distributor.trackingNo) {
        isValid = false;
        this.communicationService.showNotification('snackbar-dark', 'Please fill in all the fields for "By Courier".', 'bottom', 'center')
      }
    }

    return isValid;
  }

  deliveryChallan(obj: any) {
    if (this.validateShippingDetails(obj)) {
      const serializedProduct = JSON.stringify(obj);
      this.router.navigate(['/mnf/delivery-challan'], {
        queryParams: { product: serializedProduct, email: this.userProfile.email }
      });
    }
  }

  onCourierCompanyChange(distributor: any): void {
    if (distributor.courierCompany !== 'Other') {
      distributor.otherCompanyName = '';
    }
  }

  addOtherCompany(companyName: string): void {
    if (companyName && !this.courierCompanies.includes(companyName)) {
      this.postCourierCompany({ name: companyName });
    }
  }
}
