import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-place-order',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
  ],
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.scss'
})
export class PlaceOrderComponent {
  challan: any = {
    companyName: 'GUJARAT FREIGHT TOOLS',
    companyDetails: 'Manufacturing & Supply of Precision Press Tool & Room Component',
    companyAddress: '64, Akshay Industrial Estate, Near New Cloath Market, Ahmedabad - 38562',
    companyContact: 'Tel: 079-25820309 | Web: www.gftools.com | Email: info@gftools.com',
    companyGSTIN: '24AHDE7487RE5RT4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    challanNo: '32',
    challanDate: '05-Mar-2020',
    lrNo: '889',
    eWayNo: 'ISOGTX7880',
    transport: 'STAR TRANSPORTS',
    transportId: '522304',
    vehicleNumber: 'GJ01KH2320',
    customerName: 'Mahindra Mechanical Works',
    customerAddress: 'Mira Road, Near Shopping Mall, Surat, Gujarat - 401107',
    customerPhone: '9814556013',
    customerGSTIN: '24AACCI206D1ZG',
    placeOfSupply: 'Gujarat (24)',
    products: [
      { srNo: 1, name: 'Electric Drill Machine', hsn: '84304120', qty: '1.00 PCS', rate: 487.29, taxableValue: 487.29, cgst: 43.86, sgst: 43.86, total: 575.01 },
      { srNo: 2, name: 'Stanley Monkey Wrench', hsn: '82041120', qty: '1.00 PCS', rate: 520.00, taxableValue: 520.00, cgst: 46.80, sgst: 46.80, total: 613.60 }
    ],
    totalAmount: 1188.61,
    totalCGST: 90.66,
    totalSGST: 90.66,
    totalInWords: 'ONE THOUSAND ONE HUNDRED AND EIGHTY-NINE RUPEES ONLY'
  };

  constructor() { }

  ngOnInit(): void { }

  printChallan(): void {
    const data = document.getElementById('challan'); // Replace with your element ID
    if (data) {
      html2canvas(data, {
        scale: 3, // Increase the scale to improve image quality
        useCORS: true, // Enable cross-origin images to be loaded properly
      }).then((canvas) => {
        const imgWidth = 208;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;

        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if the content is too long
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('download.pdf');
      });
    }
  }
}
