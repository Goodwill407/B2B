import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bottom-side-advertise',
  standalone: true,
  imports: [],
  templateUrl: './bottom-side-advertise.component.html',
  styleUrl: './bottom-side-advertise.component.scss'
})
export class BottomSideAdvertiseComponent {
  
  @Input() imageUrl: string[] = [];
  currentImageIndex: number = 0;

  ngOnInit() {
    if (this.imageUrl.length > 1) {
      setInterval(() => {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.imageUrl.length;
      }, 10000); // Change image every 10 seconds
    }
  }

}
