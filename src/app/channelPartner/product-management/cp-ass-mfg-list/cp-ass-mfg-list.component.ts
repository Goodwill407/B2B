import { CommonModule, Location, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-cp-ass-mfg-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, TableModule, PaginatorModule],
  templateUrl: './cp-ass-mfg-list.component.html',
  styleUrl: './cp-ass-mfg-list.component.scss'
})
export class CpAssMfgListComponent {
  manufacturers: any[] = [];
  totalResults = 0;
  search = '';
  limit = 10;
  page = 1;
  first = 0;
  rows = 10;
  loading = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.getManufacturers();
  }

  getManufacturers(): void {
    this.loading = true;

    const body = {
      search: this.search?.trim() || '',
      page: this.page,
      limit: this.limit,
      isApproved: true,
      sortBy: 'createdAt:desc'
    };

    this.authService.post('channel-partner/my-manufacturers', body).subscribe({
      next: (res: any) => {
        this.manufacturers = res?.results || [];
        this.totalResults = res?.totalResults || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.manufacturers = [];
        this.totalResults = 0;
        this.communicationService.customError1('Unable to load manufacturers');
      }
    });
  }

  onSearch(): void {
    this.page = 1;
    this.first = 0;
    this.getManufacturers();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1;
    this.first = 0;
    this.getManufacturers();
  }

  onPageChange(event: any): void {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.first = event.first;
    this.rows = event.rows;
    this.getManufacturers();
  }

  openProducts(mfg: any): void {
    if (!this.currentUser?.email) {
      this.communicationService.customError1('Channel partner login not found');
      return;
    }

    const body = {
      manufacturerEmail: mfg.email,
      channelPartnerEmail: this.currentUser.email
    };

    this.authService.post('manufacture-commission/check', body).subscribe({
      next: (res: any) => {
        if (res?.exists) {
          this.router.navigate(['/cp/cp-mfg-product-list'], {
            queryParams: {
              manufacturerEmail: mfg.email,
              companyName: mfg.companyName,
              city: mfg.city,
              state: mfg.state,
              commission: res?.commission?.productCommission || ''
            }
          });
        } else {
          this.communicationService.customError1('Commission is not assigned by this manufacturer, so products cannot be viewed.');
        }
      },
      error: () => {
        this.communicationService.customError1('Unable to verify commission details');
      }
    });
  }

  navigateFun(): void {
    this.location.back();
  }
}