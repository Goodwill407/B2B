import { JsonPipe, UpperCasePipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService, CommunicationService, GraphService } from '@core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [
    MatCardModule, JsonPipe,
    UpperCasePipe, NgFor,
    NgIf, FormsModule,
    NgApexchartsModule,
    MatMenuModule,
    MatDialogContent,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.scss'
})
export class StudentProgressComponent {
  scoreAptitude: any;
  studProfileInsert: any;
  assessmentResponse: any;
  studentId:any = '';
  loading:boolean = false;


  constructor(private http: AuthService, @Inject(MAT_DIALOG_DATA) private data: any, public dialogRef: MatDialogRef<StudentProgressComponent>, private graphService: GraphService, private communicationService:CommunicationService) {
    if (data) {
      this.studentId = data.studentId;
      this.getAssessmentData();
    }
  }

  // Assessment Report graph
  getAssessmentData() {
    this.loading = true;
    this.http.get('assessment/get-hightlights?studentId=' + this.studentId).subscribe((res) => {
      this.assessmentResponse = res;
      this.scoreOfAptitudeGraph(res.aptitudeCounts);
      this.studentProfileGraph(res.interestCounts);
      this.loading = false;
    }, (err: any) => {
      this.communicationService.showNotification('snackbar-danger', err.error.message, "top", 'right');
      this.loading = false;
    });
  }

  scoreOfAptitudeGraph(data: any) {
    this.scoreAptitude = this.graphService.barGraphApex();
    const categories = data.map((item: any) => item.factor_name);
    const scores = data.map((item: any) => item.factor_score);
    this.scoreAptitude.series[0].data = scores;
    this.scoreAptitude.xaxis.categories = categories;
    this.scoreAptitude.series[0].name = 'Aptitude';
    this.scoreAptitude.chart.height = 250;
  }

  studentProfileGraph(data: any) {
    this.studProfileInsert = this.graphService.radarGraph();
    const categories = data.map((item: any) => item.factor_name);
    const scores = data.map((item: any) => item.factor_score);
    this.studProfileInsert.series[0].data = scores;
    this.studProfileInsert.xaxis.categories = categories;
    this.studProfileInsert.series[0].name = 'Interest';
    this.studProfileInsert.chart.height = 290;
  }

  getFormattedPersonalityCounts(): string {
    const keys = this.assessmentResponse?.personalityCounts.map((item: any) => item.factor_name) || ['NA'];
    return keys.join(', ');
  }
}
