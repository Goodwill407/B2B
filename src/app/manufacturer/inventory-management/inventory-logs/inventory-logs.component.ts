import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '@core';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-inventory-logs',
  standalone: true,
  imports: [CommonModule, TableModule, PaginatorModule, FormsModule],
  templateUrl: './inventory-logs.component.html',
  styleUrl: './inventory-logs.component.scss'
})
export class InventoryLogsComponent implements OnInit {
  tableData: any[] = [];
  totalResults: number = 0;
  page: number = 1;
  rows: number = 10;
  first: number = 0;
  searchText: string = '';

  constructor(private authService: AuthService,  private router: Router,) {}

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')!);
  let apiUrl = `manufacture-inventory-logs?userEmail=${currentUser.email}&limit=${this.rows}&page=${this.page}`;
  if (this.searchText?.trim()) {
    apiUrl += `&designNumber=${encodeURIComponent(this.searchText.trim())}`;
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
  this.router.navigate(['mnf/view-inventory-log'], {
    state: { data: row }
  });
}
}