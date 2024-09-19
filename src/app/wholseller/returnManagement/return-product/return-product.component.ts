import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { DialogformComponent } from 'app/ui/modal/dialogform/dialogform.component';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-return-product',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    AccordionModule,
    CommonModule
  ],
  templateUrl: './return-product.component.html',
  styleUrl: './return-product.component.scss'
})
export class ReturnProductComponent {

  inwardStock: any[]=[];
  showFlag: boolean = false;
  courierCompanies:any;
  transportTypes: any = ['By Air', 'By Ship', 'By Road', 'By Courier'];

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.authService.get(`issue-products?customerEmail=${this.authService.currentUserValue.email}`).subscribe(
      (res: any) => {
        this.inwardStock = res.results.map((item:any) => {
          delete item.transportType;
          delete item.lrNo;
          delete item.eWayNo;
          delete item.transport;
          delete item.vehicleNumber;
          return{
            ...item,
           ebill: '',
           transportType: '',
           transportCompany: '',
           lorryReceiptNo: '',
           vehicleNo: '',
           receiptNo: '',
           courierCompany: '',
           otherCompanyName: '',
           trackingNo: '',
          }
        });
        this.inwardStock.forEach((item:any)=>{          
         
        })

      },
      (err: any) => {
        this.communicationService.customError(err.error.message);
      }
    );
  }


  // objectKeys(obj: any): string[] {
  //   return Object.keys(obj);
  // }

  returnProduct(obj: any): void {

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
      this.router.navigate(['/wholesaler/return-mng/return-order'], {
        queryParams: { product: serializedProduct }
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
  postCourierCompany(data: any) {
    this.authService.post('courier', data).subscribe((data) => {
      console.log(data);
    })
  }
}
