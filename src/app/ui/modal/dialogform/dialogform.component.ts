import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogTitle, MatDialogContent, MatDialogRef, MatDialogActions, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

type ReasonMapping = {
  'Size or fit issue': string[];
  'Product quality issue': string[];
  'Damaged or used product': string[];
  'Does not look good on me': string[];
  'Did not like the color': string[];
  'Item no longer needed': string[];
  'Item or part missing': string[];
  'Product different from website': string[];
};

@Component({
  selector: 'app-dialogform',
  templateUrl: './dialogform.component.html',
  styleUrls: ['./dialogform.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatSelectModule,
    MatDialogActions
  ],
})
export class DialogformComponent implements OnInit {
  selectedReason: any = '';
  selectedSubReason: any = '';
  subReasons: string[] = [];
  productData:any;

  reasons = ['Size or fit issue', 'Product quality issue', 'Damaged or used product', 'Does not look good on me', 'Did not like the color', 'Item no longer needed', 'Item or part missing', 'Product different from website',
  ];

  subReasonMapping: ReasonMapping = {
    'Size or fit issue': ['Item does not fit', 'Fit is not good', 'Other'],
    'Product quality issue': [ 'Poor fabric quality','Poor stitch quality','Poor zipper quality','Poor print quality','Poor quality after wash', ],
    'Damaged or used product': ['Item is damaged/torn', 'Item is dirty/stained', 'Used product received'],
    'Does not look good on me': ['Item does not look good', 'Part does not look good', 'Other'],
    'Did not like the color': ['Item broken', 'Item not functioning', 'Other'],
    'Item no longer needed': ['Item is fine but no longer needed', 'Bought by mistake', 'Ordered wrong size/colour', 'Better price available'],
    'Item or part missing': ['Item missing', 'Incomplete set received'],
    'Product different from website': [ 'Product entirely different','Wrong brand received','Wrong size received','Wrong colour received','Wrong style received - print/design/fit','Product looks different from photo','Wrong product details mentioned',],
  };


  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<DialogformComponent>) {
      this.productData = data;
     }

  ngOnInit(): void {
    // Initialize any necessary logic
  }

  onReasonChange(event: any) {
    this.subReasons = this.subReasonMapping[event.target.value as keyof ReasonMapping] || [];
  }

  onSave(): void {
    // Return the modified data to the parent component
    this.dialogRef.close({ selectedReason: this.selectedReason, subReason: this.selectedSubReason,...this.productData });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
