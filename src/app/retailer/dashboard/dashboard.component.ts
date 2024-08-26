import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GraphService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgApexchartsModule,
    CommonModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  
  public chartOptions: any;
  currentMonth: Date = new Date();

  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';

  constructor(private graphService: GraphService) { }

  ngOnInit(): void {
    this.chartOptions = this.graphService.getLineChartData();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
  }
  
}
