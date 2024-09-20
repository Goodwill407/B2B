import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './image-dialog.component.html',
  styleUrl: './image-dialog.component.scss'
})
export class ImageDialogComponent {
  imgPath:string = '';
  width: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.imgPath = data.path;
    this.width = data.width;

  }

}
