import { CommonModule, DatePipe, NgClass, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService, CommunicationService } from '@core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-channel-partner',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgClass,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    TitleCasePipe
  ],
  templateUrl: './view-channel-partner.component.html',
  styleUrl: './view-channel-partner.component.scss',
  providers: [DatePipe]
})
export class ViewChannelPartnerComponent {

  cpEmail: string = '';
  cpData: any = null;
  user: any;
  isLoading: boolean = true;
  notFound: boolean = false;

  // Commission
  commissionCategories: any[] = [];
  selectedCategory: any = null;
  isDropdownDisabled: boolean = false;
  assignBtnHide: boolean = true;
  existingCommission: any = null;
  fromLink: boolean = false;

  requestStatus: string = ''; // 'pending' | 'accepted' | 'rejected' | ''
  isRequestLoading: boolean = false;

  brandPopupPage: number = 1;
  brandPopupLimit: number = 6;

  chunkSize: number = 5; // rows per column table
  manufacturerChunks: any[][] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private location: Location,
    private datePipe: DatePipe
  ) {}

ngOnInit() {
  this.user = this.authService.currentUserValue;
  this.cpEmail = this.route.snapshot.paramMap.get('id') || '';

  const from = this.route.snapshot.queryParamMap.get('from');
  this.fromLink = from === 'link';

  if (this.cpEmail) {
    // ✅ Always load both — categories first, then CP data
    if (!this.fromLink) {
      this.getCommissionCategoriesFirst(); // ← new method
    } else {
      this.getChannelPartnerData();
    }
  }
}

linkChannelPartner() {
  this.authService.post('channel-partner/link', { cpEmail: this.cpData.email }).subscribe({
    next: () => {
      this.communicationService.showNotification('snackbar-success', 'Channel Partner linked successfully', 'bottom', 'center');
      this.getChannelPartnerData(); // refresh
    },
    error: (err: any) => {
      this.communicationService.showNotification('snackbar-danger', err?.error?.message || 'Failed to link', 'bottom', 'center');
    }
  });
}

buildManufacturerChunks() {
  const arr = this.cpData?.linkedManufacturers || [];
  this.manufacturerChunks = [];
  for (let i = 0; i < arr.length; i += this.chunkSize) {
    this.manufacturerChunks.push(arr.slice(i, i + this.chunkSize));
  }
}

getCommissionCategoriesFirst() {
  this.authService
    .get(`manufacture-commission?categoryBy=${this.user.email}&page=1&limit=100`)
    .subscribe({
      next: (res: any) => {
        this.commissionCategories = res.results;
        // ✅ Now load CP data AFTER categories are ready
        this.getChannelPartnerData();
      },
      error: () => {
        // even if categories fail, still load CP data
        this.getChannelPartnerData();
      }
    });
}

isAlreadyLinked(): boolean {
  return this.cpData?.linkedManufacturers?.some(
    (m: any) => m.manufacturerEmail === this.user.email
  );
}

  getChannelPartnerData() {
    this.isLoading = true;
    this.authService.get(`channel-partner/email/${this.cpEmail}`).subscribe({
      next: (res: any) => {
        this.cpData = res;
        // format dates
        if (this.cpData.establishDate) {
          this.cpData.establishDate = this.datePipe.transform(this.cpData.establishDate, 'dd MMM yyyy');
        }
        if (this.cpData.registerOnFTH) {
          this.cpData.registerOnFTH = this.datePipe.transform(this.cpData.registerOnFTH, 'dd MMM yyyy');
        }
        this.isLoading = false;
        this.loadExistingCommission();
        this.checkExistingRequest();
        this.buildManufacturerChunks();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notFound = true;
        this.communicationService.showNotification('snackbar-danger', 'Channel Partner not found', 'bottom', 'center');
        setTimeout(() => this.location.back(), 3000);
      }
    });
  }

  unlinkChannelPartner() {
  if (!confirm(`Are you sure you want to unlink this Channel Partner?`)) return;

  this.authService.post('channel-partner/unlink', { cpEmail: this.cpData.email }).subscribe({
    next: () => {
      this.communicationService.showNotification(
        'snackbar-success',
        'Channel Partner unlinked successfully',
        'bottom',
        'center'
      );
      this.getChannelPartnerData(); // refresh
    },
    error: (err: any) => {
      this.communicationService.showNotification(
        'snackbar-danger',
        err?.error?.message || 'Failed to unlink',
        'bottom',
        'center'
      );
    }
  });
}

getCommissionCategories() {
  this.authService
    .get(`manufacture-commission?categoryBy=${this.user.email}&page=1&limit=100`)
    .subscribe({
      next: (res: any) => {
        this.commissionCategories = res.results;
      },
      error: () => {}
    });
}

  loadExistingCommission() {
  if (!this.cpData) return;

  const existing = this.cpData.commissionGiven?.find(
    (c: any) => c.commissionGivenBy === this.user.email
  );

  if (existing) {
    this.existingCommission = existing;

    // ✅ Match by id — get exact object reference from commissionCategories array
    const matchedCat = this.commissionCategories.find(
      (cat: any) => cat.id === existing.id
    );

    // ✅ If found in categories → set reference (dropdown will show it)
    // If NOT found (category deleted) → set null so dropdown shows "-- Select Category --"
    this.selectedCategory = matchedCat || null;

    this.isDropdownDisabled = true;
    this.assignBtnHide = false;
  } else {
    // ✅ No commission assigned yet → reset all
    this.existingCommission = null;
    this.selectedCategory = null;
    this.isDropdownDisabled = false;
    this.assignBtnHide = true;
  }
}

checkExistingRequest() {
  // Check if manufacturer already sent a request to this CP
  this.authService
    .get(`request?requestByEmail=${this.user.email}&email=${this.cpEmail}`)
    .subscribe({
      next: (res: any) => {
        const found = res.results?.find(
          (r: any) =>
            r.requestByEmail === this.user.email &&
            r.email === this.cpEmail
        );
        this.requestStatus = found?.status || '';
      },
      error: () => {
        this.requestStatus = '';
      }
    });
}

sendLinkRequest() {
  if (!confirm(`Send a link request to "${this.cpData.fullName}"?`)) return;
  this.isRequestLoading = true;

  // ✅ First fetch full manufacturer profile to get city/state/country
  this.authService.get(`manufacturers/${this.user.email}`).subscribe({
    next: (mfg: any) => {
      const body = {
        // ✅ RECEIVER — CP
        email: this.cpData.email,
        fullName: this.cpData.fullName,
        companyName: this.cpData.companyName || '',
        mobileNumber: this.cpData.mobNumber || '',
        city: this.cpData.city || '',
        state: this.cpData.state || '',
        country: this.cpData.country || '',
        role: 'channelPartner',

        // ✅ SENDER — Manufacturer (now fully filled from API)
        requestByEmail: mfg.email,
        requestByFullName: mfg.fullName,
        requestByCompanyName: mfg.companyName || '',
        requestByMobileNumber: mfg.mobNumber || '',
        requestByCity: mfg.city || '',
        requestByState: mfg.state || '',
        requestByCountry: mfg.country || '',
        requestByCountryCode: mfg.contryCode || '',
        requestByRole: 'manufacturer',
      };

      this.authService.post('request', body).subscribe({
        next: () => {
          this.isRequestLoading = false;
          this.requestStatus = 'pending';
          this.communicationService.showNotification(
            'snackbar-success',
            'Link request sent successfully',
            'bottom',
            'center'
          );
        },
        error: (err: any) => {
          this.isRequestLoading = false;
          this.communicationService.showNotification(
            'snackbar-danger',
            err?.error?.message || 'Failed to send request',
            'bottom',
            'center'
          );
        }
      });
    },
    error: () => {
      this.isRequestLoading = false;
      this.communicationService.showNotification(
        'snackbar-danger',
        'Failed to fetch manufacturer details',
        'bottom',
        'center'
      );
    }
  });
}

  assignCommission() {
    if (!this.selectedCategory) {
      this.communicationService.showNotification('snackbar-danger', 'Please select a commission category', 'bottom', 'center');
      return;
    }

    const body = {
      channelPartnerEmail: this.cpData.email,
      categoryId: this.selectedCategory.id
    };

    this.authService.post('manufacture-commission/assign', body).subscribe({
      next: (res: any) => {
        this.existingCommission = res.commission;
        this.isDropdownDisabled = true;
        this.assignBtnHide = false;
        this.communicationService.showNotification('snackbar-success', 'Commission assigned successfully', 'bottom', 'center');
        this.getChannelPartnerData();
      },
      error: (err: any) => {
        this.communicationService.showNotification('snackbar-danger', err?.error?.message || 'Failed to assign commission', 'bottom', 'center');
      }
    });
  }

  editCommission() {
  this.assignBtnHide = true;
  this.isDropdownDisabled = false;
  // this.selectedCategory = null; 
}

  navigateBack() {
    this.location.back();
  }

  viewBrands(mfg: any) {
  this.brandPopupPage = 1;
  this.loadBrandsPopup(mfg.manufacturerEmail, mfg.manufacturerName);
}


getManufacturerChunks(): any[][] {
  const arr = this.cpData?.linkedManufacturers || [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += this.chunkSize) {
    chunks.push(arr.slice(i, i + this.chunkSize));
  }
  return chunks;
}

loadBrandsPopup(mfgEmail: string, mfgName: string) {
  this.authService
    .get(`brand?page=${this.brandPopupPage}&limit=${this.brandPopupLimit}&brandOwner=${mfgEmail}`)
    .subscribe({
      next: (res: any) => {
        const brands = res.results || [];
        const totalPages = res.totalPages || 1;
        const currentPage = res.page || 1;

        // Build brand cards HTML
        const brandsHTML = brands.length > 0
          ? brands.map((b: any) => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;background:#fafafa;">
                <img src="${b.brandLogo}" alt="${b.brandName}"
                  style="width:42px;height:42px;border-radius:6px;object-fit:cover;border:1px solid #ddd;"
                  onerror="this.src='https://via.placeholder.com/42x42?text=B'">
                <span style="font-size:13px;font-weight:600;color:#333;">${b.brandName}</span>
                <span style="font-size:11px;color:#888;margin-left:4px;">— ${b.brandDescription || ''}</span>
              </div>`).join('')
          : `<div style="text-align:center;color:#aaa;padding:20px;">No brands found</div>`;

        // Pagination HTML
        const paginationHTML = totalPages > 1 ? `
          <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;">
            <button id="swal-prev-btn"
              style="padding:4px 12px;border-radius:6px;border:1px solid #ddd;background:${currentPage === 1 ? '#f5f5f5' : '#f0ad4e'};color:${currentPage === 1 ? '#aaa' : '#fff'};cursor:${currentPage === 1 ? 'not-allowed' : 'pointer'};font-size:12px;"
              ${currentPage === 1 ? 'disabled' : ''}>
              ← Prev
            </button>
            <span style="font-size:12px;color:#666;">Page ${currentPage} of ${totalPages}</span>
            <button id="swal-next-btn"
              style="padding:4px 12px;border-radius:6px;border:1px solid #ddd;background:${currentPage === totalPages ? '#f5f5f5' : '#f0ad4e'};color:${currentPage === totalPages ? '#aaa' : '#fff'};cursor:${currentPage === totalPages ? 'not-allowed' : 'pointer'};font-size:12px;"
              ${currentPage === totalPages ? 'disabled' : ''}>
              Next →
            </button>
          </div>` : '';

        Swal.fire({
          title: `<span style="font-size:16px;font-weight:700;">Brands by ${mfgName}</span>`,
          html: `
            <div style="max-height:350px;overflow-y:auto;padding-right:4px;">
              ${brandsHTML}
            </div>
            ${paginationHTML}`,
          showConfirmButton: false,
          showCloseButton: true,
          width: '480px',
          didOpen: () => {
            const prevBtn = document.getElementById('swal-prev-btn');
            const nextBtn = document.getElementById('swal-next-btn');

            if (prevBtn) {
              prevBtn.addEventListener('click', () => {
                if (this.brandPopupPage > 1) {
                  this.brandPopupPage--;
                  Swal.close();
                  this.loadBrandsPopup(mfgEmail, mfgName);
                }
              });
            }

            if (nextBtn) {
              nextBtn.addEventListener('click', () => {
                if (this.brandPopupPage < totalPages) {
                  this.brandPopupPage++;
                  Swal.close();
                  this.loadBrandsPopup(mfgEmail, mfgName);
                }
              });
            }
          }
        });
      },
      error: () => {
        this.communicationService.showNotification(
          'snackbar-danger', 'Failed to load brands', 'bottom', 'center'
        );
      }
    });
}
}