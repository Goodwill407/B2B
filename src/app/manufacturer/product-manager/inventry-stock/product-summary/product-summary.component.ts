import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-summary',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './product-summary.component.html',
  styleUrl: './product-summary.component.scss'
})
export class ProductSummaryComponent {
  product:any;

  constructor(private authService: AuthService, private route:ActivatedRoute,private location: Location) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.getProductDetails(id);
      }
    });
  }

  getProductDetails(id: any) {
    this.authService.get('products/' + id).subscribe((res: any) => {
      if (res) {
        this.product = res;
      }
    });
    
  }
  
  navigateFun() {
    this.location.back();
  }

}
