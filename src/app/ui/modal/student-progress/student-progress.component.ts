import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [
    MatCardModule,
    FormsModule,
    MatIcon,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.scss']
})
export class StudentProgressComponent {
  productData: any;
  issueOptions = ['Defective product', 'Not as described', 'Not needed', 'Other'];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any, 
    public dialogRef: MatDialogRef<StudentProgressComponent>
  ) {
    // Ensure productData is properly initialized with all expected properties
    this.productData = {
      qtyReceived: data?.qtyReceived || '',
      issue: data?.issue || '',
      otherIssue: data?.otherIssue || '',
      ...data // Spread other properties like designNo, name, etc.
    };
  }

  onSave(): void {
    // Return the modified data to the parent component
    this.dialogRef.close(this.productData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onIssueChange(): void {
    // Reset 'Other' issue field when 'Other' is selected
    if (this.productData.issue === 'Other') {
      this.productData.otherIssue = '';
    }
  }
}
