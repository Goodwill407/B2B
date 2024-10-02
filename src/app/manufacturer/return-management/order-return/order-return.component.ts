import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-order-return',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    AccordionModule,
    CommonModule
  ],
  templateUrl: './order-return.component.html',
  styleUrl: './order-return.component.scss'
})
export class OrderReturnComponent {
  allData: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private location: Location, private router:Router) { }

  ngOnInit() {
    this.getReturnOrderList();
  }

  getReturnOrderList() {
    this.authService.get(`return-order?companyEmail=${this.authService.currentUserValue.email}`).subscribe((res) => {
      this.allData = res.results;
    })
  }

  deliveryChallan(obj: any) {
      const serializedProduct = JSON.stringify(obj);
      this.router.navigate(['/mnf/return-mng/return-challan'], {
        queryParams: { product: serializedProduct }
      });    
  }
}
