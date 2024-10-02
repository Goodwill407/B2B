import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-return-challan',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './return-challan.component.html',
  styleUrl: './return-challan.component.scss'
})
export class ReturnChallanComponent implements OnInit {
  challan: any = {};
  email: any;
  product: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService, private location: Location) { }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const productString = params.get('product');
      if (productString) {
        this.challan = JSON.parse(productString);
      }
    });
  }



  convertNumberToWords(amount: number): string {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (amount === 0) return "Zero";

    let words = '';

    function numberToWords(num: number, index: number): string {
      let str = '';
      if (num > 99) {
        str += units[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num > 10 && num < 20) {
        str += teens[num - 11] + " ";
      } else {
        str += tens[Math.floor(num / 10)] + " ";
        str += units[num % 10] + " ";
      }
      if (str.trim().length > 0) {
        str += thousands[index] + " ";
      }
      return str;
    }

    let i = 0;
    while (amount > 0) {
      words = numberToWords(amount % 1000, i) + words;
      amount = Math.floor(amount / 1000);
      i++;
    }

    return words.trim();
  }

  printChallan(): void {
    const data = document.getElementById('challan');
    if (data) {
      html2canvas(data, { scale: 3, useCORS: true }).then((canvas) => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 10;
        let position = margin;

        // Add the company logo image using jsPDF directly
        pdf.addImage(this.challan.logoUrl, 'JPEG', margin, position, 50, 20); // Adjust size & position as needed

        // Adjust position to move content below the image
        position += 30;

        // Add the canvas content (everything else inside the challan div)
        pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);

        // Save the PDF
        pdf.save('challan.pdf');
      });
    }
  }

  navigateFun() {
    this.location.back();
  }

  generateDC(obj: any): void {
    this.authService.post('return-order', obj).subscribe((res: any) => {
      this.communicationService.customSuccess('Return Ordered Generated Successfully');
      setTimeout(()=>{this.navigateFun()},2000);
    }, (error: any) => {
      this.communicationService.customError(error.error.message);
    });
  }
}
