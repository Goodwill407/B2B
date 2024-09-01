import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '@core';
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
  styleUrls: ['./place-order.component.scss']
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
      { srNo: 1, name: 'Electric Drill Machine', hsn: '84304120', qty: '1.00 PCS', rate: 487.29, taxableValue: 487.29, gst: 87.72, total: 575.01 },
      { srNo: 2, name: 'Stanley Monkey Wrench', hsn: '82041120', qty: '1.00 PCS', rate: 520.00, taxableValue: 520.00, gst: 93.60, total: 613.60 }
    ],
    totalAmount: 1188.61,
    totalGST: 181.32,
    totalInWords: 'ONE THOUSAND ONE HUNDRED AND EIGHTY-NINE RUPEES ONLY'
  };

  constructor(private authService: AuthService) { }
  ngOnInit(): void {
    this.authService.get('cart/place-order/products/rajputsagar7798@gmail.com').subscribe((res: any) => {
      const response = res[0]; // Assuming res[0] is the relevant data
  
      // Update challan object with dynamic data from the response
      this.challan = {
        ...this.challan,
        companyName: response.manufacturer.companyName,
        companyDetails: 'Manufacturing & Supply of Precision Press Tool & Room Component', // This is static, keep or change as needed
        companyAddress: response.manufacturer.address,
        companyContact: `Tel: ${response.manufacturer.mobNumber} | Email: ${response.manufacturer.email}`,
        companyGSTIN: response.manufacturer.gstNumber || '24AHDE7487RE5RT4', // Update GSTIN if available in the response
        challanNo: '32', // This could be generated dynamically if needed
        challanDate: new Date().toLocaleDateString(), // Use current date
        lrNo: '000', // Static or dynamic
        eWayNo: '000', // Static or dynamic
        transport: response.wholesaler.companyName || 'STAR TRANSPORTS',
        transportId: response.wholesaler.code,
        vehicleNumber: 'MH01KH2320', // Static or dynamic
        customerName: response.wholesaler.fullName,
        customerAddress: response.wholesaler.address + ', ' + response.wholesaler.city,
        customerPhone: response.wholesaler.mobNumber,
        customerGSTIN: response.wholesaler.gstNumber || '24AACCI206D1ZG', // Update GSTIN if available in the response
        placeOfSupply: response.wholesaler.address, // Static or dynamic
        products: response.products.map((product: any, index: number) => {
          const gst = (product.productId.setOfManPrice * 0.18).toFixed(2); // Assuming 18% GST
          return {
            srNo: index + 1,
            name: product.productId.productTitle,
            hsn: 'HSN_CODE', // Update if available
            qty: product.quantity,
            rate: product.productId.setOfManPrice,
            taxableValue: product.productId.setOfManPrice * product.quantity,
            gst: gst,
            total: (product.productId.setOfManPrice * product.quantity + parseFloat(gst)).toFixed(2),
          };
        }),
        totalAmount: response.products.reduce((sum: number, product: any) => sum + product.productId.setOfManPrice * product.quantity + parseFloat((product.productId.setOfManPrice * 0.18).toFixed(2)), 0).toFixed(2),
        totalGST: response.products.reduce((sum: number, product: any) => sum + parseFloat((product.productId.setOfManPrice * 0.18).toFixed(2)), 0).toFixed(2),
      };
  
      // Convert total amount to words
      this.challan.totalInWords = this.convertNumberToWords(parseFloat(this.challan.totalAmount)) + " Rupees Only";
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

}
