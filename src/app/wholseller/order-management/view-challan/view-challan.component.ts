import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-challan',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './view-challan.component.html',
  styleUrl: './view-challan.component.scss'
})
export class ViewChallanComponent {
  challan: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService,private location: Location) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('product');
      if (id) {// Deserialize the product string back to an object
        this.authService.get('dilevery-order/'+id).subscribe((res:any)=>{
          this.challan = res;
        })
      }
    });
  }

  printChallan(): void {
    const data = document.getElementById('challan');
    if (data) {
      html2canvas(data, {
        scale: 3, 
        useCORS: true, 
      }).then((canvas: { height: number; width: number; toDataURL: (arg0: string) => any; }) => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 10; // Add margin
        let position = margin;

        pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if the content is too long
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('download.pdf');
      });
    }
  }

  navigateFun() {
    this.location.back();
  }
}