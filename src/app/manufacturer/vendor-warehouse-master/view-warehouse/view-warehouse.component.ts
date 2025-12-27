import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-view-warehouse',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, TagModule, ButtonModule, DividerModule],
  templateUrl: './view-warehouse.component.html',
  styleUrl: './view-warehouse.component.scss',
})
export class ViewWarehouseComponent implements OnInit {
  warehouseId!: string;
  warehouse: any;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit(): void {
    this.warehouseId = this.route.snapshot.paramMap.get('id') as string;
    if (this.warehouseId) {
      this.loadWarehouse();
    }
  }

  loadWarehouse(): void {
    this.loading = true;
    const url = `manufacture-warehouse/${this.warehouseId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.warehouse = res;
        this.loading = false;
      },
      () => {
        this.communicationService.customError1('Failed to load warehouse details');
        this.loading = false;
      }
    );
  }

  getRowBadgesPreview(rowNames: string[]): { firstTen: string[]; extra: number } {
    const list = rowNames || [];
    return {
      firstTen: list.slice(0, 10),
      extra: list.length > 10 ? list.length - 10 : 0,
    };
  }
}
