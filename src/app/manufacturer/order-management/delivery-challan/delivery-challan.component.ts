import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-delivery-challan',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
  ],
  templateUrl: './delivery-challan.component.html',
  styleUrl: './delivery-challan.component.scss'
})
export class DeliveryChallanComponent {
  challan: any = {
    companyName: 'GUJARAT FREIGHT TOOLS',
    companyDetails: 'Manufacturing & Supply of Precision Press Tool & Room Component',
    companyAddress: '64, Akshay Industrial Estate, Near New Cloath Market, Ahmedabad - 38562',
    companyContact: 'Tel: 079-25820309 | Web: www.gftools.com | Email: info@gftools.com',
    companyGSTIN: '24AHDE7487RE5RT4',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    challanNo: '32',
    challanDate: '',
    lrNo: '889',
    eWayNo: 'ISOGTX7880',
    transport: 'STAR TRANSPORTS',
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
  email: any;
  product: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private communicationService: CommunicationService) { }
  ngOnInit(): void {
    debugger
    this.authService.get('dilevery-order/get/challan/number?email=' + this.authService.currentUserValue.email).subscribe((res: any) => {
      this.challan.logoUrl = res.profileImg ? this.authService.cdnPath + res.profileImg : 'assets/images/user/person.png';
      this.challan.challanNo = res.challanNo;
    }, (err: any) => {
      this.communicationService.customError(err.error.message);
    });
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email');
      const productString = params.get('product');
      if (productString) {
        this.product = JSON.parse(productString); // Deserialize the product string back to an object

        this.challan.companyName = this.product.supplierName;
        this.challan.companyDetails = this.product.supplierDetails;
        this.challan.companyAddress = this.product.supplierAddress;
        this.challan.companyContact = `${this.product.supplierContact}`;
        this.challan.companyGSTIN = this.product.supplierGSTIN;
        this.challan.companyEmail = this.product.supplierEmail;

        this.challan.customerName = this.product.buyerName;
        this.challan.customerDetails = this.product.buyerDetails;
        this.challan.customerAddress = this.product.buyerAddress;
        this.challan.customerPhone = this.product.buyerPhone;
        this.challan.customerGSTIN = this.product.buyerGSTIN;
        this.challan.customerEmail = this.product.buyerEmail;
        this.challan.pONumber = this.product.poNumber;
        this.challan.challanDate = new Date().toLocaleDateString(); // Format date as needed
        this.challan.lrNo = this.product.lorryReceiptNo || this.product.trackingNo || this.product.receiptNo;
        this.challan.eWayNo = this.product.ebill;
        this.challan.transport = this.product.transportCompany || this.product.courierCompany || this.product.otherCompanyName;
        this.challan.vehicleNumber = this.product.vehicleNo;
        this.challan.transportType = this.product.transportType;

        // Map the products array from the product data
        this.challan.products = this.product.products.map((prod: any, index: number) => {
          const total = Number(prod.rate * prod.deliveryQty)
          return {
            srNo: index + 1,
            name: prod.name,
            designNo: prod.designNo, // Assuming designNo is HSN
            qty: `${prod.deliveryQty}`, // Assuming qty is the number of pieces
            demandQty: prod.qty, // Assuming demandQty
            rate: prod.rate,
            taxableValue: total,
            gst: Number((total * 0.18).toFixed(2)),
            total: Number((total * 0.18 + total).toFixed(2))
          }
        }
        );

        // Step 1: Calculate the total rate (without GST)
        this.challan.totalRate = this.product.products
          .reduce((sum: number, prod: any) => sum + prod.rate * prod.deliveryQty, 0)
          .toFixed(2);

        // Step 2: Apply the discount (discount is applied on totalRate before GST)
        const discount = parseFloat(this.product.discount || 0);
        const discountedTotalRate = (parseFloat(this.challan.totalRate) - discount).toFixed(2);
        this.challan.discount = discount;

        // Step 3: Calculate the GST on the discounted total rate
        this.challan.totalGST = this.product.products
          .reduce((sum: number, prod: any) => sum + parseFloat((prod.rate * prod.deliveryQty * 0.18).toFixed(2)), 0)
          .toFixed(2);

        // Step 4: Calculate the total amount (discounted total + GST)
        this.challan.totalAmount = (parseFloat(discountedTotalRate) + parseFloat(this.challan.totalGST)).toFixed(2);

        // Step 5: Round off the total amount
        this.challan.roundedOffTotal = Math.round(parseFloat(this.challan.totalAmount));

        // Step 6: Convert the rounded total amount to words
        this.challan.totalInWords = this.convertNumberToWords(parseFloat(this.challan.roundedOffTotal));

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



  generateDC(obj: any): void {
    this.authService.post('dilevery-order', obj).subscribe((res: any) => {
      this.communicationService.customSuccess('Delivery Challan Generated Successfully');
    }, (error: any) => {
      this.communicationService.customError(error.error.message);
    });
  }
}
