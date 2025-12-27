import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';

interface Vendor {
  id: string;
  code: string;
  vendorName: string;
  companyName: string;
  contactPersonName: string;
  vendorEmail: string;
  contactNumber: string;
  altContactNumber: string;
  gstNumber: string;
  panNumber: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  materialCategories: string[];
  paymentTerms: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    accountType: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
    swiftCode: string;
    upiId: string;
    bankAddress: string;
  };
  notes: string;
  isActive: boolean;
  manufacturerEmail: string;
}

@Component({
  selector: 'app-view-vendor',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ChipModule
  ],
  templateUrl: './view-vendor.component.html',
  styleUrl: './view-vendor.component.scss'
})
export class ViewVendorComponent implements OnInit {
  vendor!: Vendor;
  loading: boolean = false;
  vendorId: string = '';

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.vendorId = this.route.snapshot.paramMap.get('id') || '';
    if (this.vendorId) {
      this.loadVendorData(this.vendorId);
    }
  }

  loadVendorData(id: string): void {
    this.loading = true;
    const url = `manufacturer-vendors/${id}`;
    
    this.authService.get(url).subscribe(
      (vendor: any) => {
        this.vendor = vendor;
        this.loading = false;
      },
      (err) => {
        console.error('Error loading vendor:', err);
        this.communicationService.customError1('Failed to load vendor details');
        this.loading = false;
      }
    );
  }

  getFullAddress(): string {
    if (!this.vendor?.address) return 'N/A';
    const parts = [
      this.vendor.address.line1,
      this.vendor.address.line2,
      this.vendor.address.city,
      this.vendor.address.state,
      this.vendor.address.pinCode
    ].filter(Boolean);
    return parts.join(', ');
  }

  navigateBack(): void {
    this.location.back();
  }

  editVendor(): void {
    this.router.navigate(['/mnf/update-vendor', this.vendorId]);
  }
}
