import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-manufacturer-list',
  standalone: true,
  imports: [
    TableModule,
    PaginatorModule,
    NgIf, RouterModule
  ],
  templateUrl: './manufacturer-list.component.html',
  styleUrl: './manufacturer-list.component.scss'
})
export class ManufacturerListComponent {

  allMnf: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  user: any;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllMnf();
  }

  getAllMnf() {
    this.authService.get(`wholesaler/manufactureList/${this.user.email}`).subscribe((res: any) => {
      this.allMnf = res;
      this.totalResults = res.totalResults;
    })
  }


  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    // this.getAllMnf();
  }

  navigateToProduct(email: string) {
    this.router.navigate(['/wholesaler/mnf-product'], {queryParams:{ email: email }});
  }
}
