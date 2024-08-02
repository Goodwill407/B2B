import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-right-side-advertise',
  standalone: true,
  imports: [NgFor],
  templateUrl: './right-side-advertise.component.html',
  styleUrl: './right-side-advertise.component.scss'
})
export class RightSideAdvertiseComponent {

  @Input() imageUrls: string[] = [];

}
