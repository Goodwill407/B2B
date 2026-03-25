import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';

@Component({
  selector: 'app-whlsr-inventory-logs-list',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule, FormsModule, BottomSideAdvertiseComponent],
  templateUrl: './whlsr-inventory-logs-list.component.html',
  styleUrl: './whlsr-inventory-logs-list.component.scss'
})
export class WhlsrInventoryLogsListComponent implements OnInit {
  tableData: any[] = [];
  totalResults: number = 0;
  page: number = 1;
  rows: number = 10;
  first: number = 0;
  searchText: string = '';

   bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
    let apiUrl = `wholesaler-inventory-logs?userEmail=${currentUser.email}&limit=${this.rows}&page=${this.page}`;
    
    if (this.searchText?.trim()) {
      apiUrl += `&search=${encodeURIComponent(this.searchText.trim())}`;
    }
    
    this.authService.get(apiUrl).subscribe((res: any) => {
      this.tableData = res.results;
      this.totalResults = res.totalResults;
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.rows = event.rows;
    this.first = event.first;
    this.getAllData();
  }

  search() {
    this.page = 1;  // Reset to first page
    this.first = 0;
    this.getAllData();
  }

  clearSearch() {
    this.searchText = '';
    this.search();
  }

  viewRow(row: any) {
    console.log(row);
    this.router.navigate(['wholesaler/wh-inventory-log-view'], {
      state: { data: row }
    });
  }
}
