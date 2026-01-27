import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

interface RawItem {
  id: string;
  itemName: string;
  code: string;
  stockInHand: number;
  details: string;
  note: string;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  categoryCode: string;
  subcategoryId: any;
  subcategoryName: string;
  subcategoryCode: string;
  vendorDetails: {
    vendorName: string;
    companyName: string;
    contactPersonName: string;
    vendorEmail: string;
    contactNumber: string;
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
  };
  warehouseDetails: {
    warehouseName: string;
    code: string;
    contactPersonName: string;
    contactNumber: string;
    email: string;
    isPrimary: boolean;
    storageCapacity: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      country: string;
      pinCode: string;
    };
  };
  rackRowMappings: Array<{
    rackName: string;
    rowName: string;
  }>;
  photo1?: string;
  photo2?: string;
  manufacturerEmail: string;
}

@Component({
  selector: 'app-raw-item-view',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ImageModule,
    DividerModule,
    SkeletonModule,
  ],
  templateUrl: './raw-item-view.component.html',
  styleUrl: './raw-item-view.component.scss',
})
export class RawItemViewComponent implements OnInit {
  item: RawItem | null = null;
  loading = false;
  itemId: string | null = null;

  constructor(
    private authService: AuthService,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.loadItem(this.itemId);
    }
  }

  loadItem(id: string): void {
    this.loading = true;
    this.authService.get(`manufacture-item/${id}`).subscribe(
      (res: any) => {
        this.item = res.data || res;
        this.loading = false;
      },
      (err) => {
        this.communicationService.customError1('Failed to load item details');
        this.loading = false;
      }
    );
  }

  goBack(): void {
    this.location.back();
  }

  // editItem(): void {
  //   if (this.itemId) {
  //     // Navigate to edit page - adjust route as needed
  //     window.location.href = `/mnf/raw-items/edit/${this.itemId}`;
  //   } 
  // }

  getFullAddress(address: any): string {
    if (!address) return 'N/A';
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.state,
      address.country,
      address.pinCode,
    ].filter((part) => part && part.trim() !== '');
    return parts.join(', ');
  }

  hasPhotos(): boolean {
    return !!(this.item?.photo1 || this.item?.photo2);
  }
}
