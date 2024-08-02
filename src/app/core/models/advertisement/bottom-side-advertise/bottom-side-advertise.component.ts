import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bottom-side-advertise',
  standalone: true,
  imports: [],
  templateUrl: './bottom-side-advertise.component.html',
  styleUrl: './bottom-side-advertise.component.scss'
})
export class BottomSideAdvertiseComponent {
  
  @Input() imageUrl: string = '';

}
