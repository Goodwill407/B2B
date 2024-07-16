import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService, GraphService } from '@core';
import { NgApexchartsModule } from 'ng-apexcharts';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule,CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  public chartOptions: any;
  currentMonth: Date = new Date();

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
