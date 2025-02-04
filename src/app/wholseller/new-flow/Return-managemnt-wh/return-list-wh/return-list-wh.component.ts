import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
@Component({
  selector: 'app-return-list-wh',
  standalone: true,
  imports: [
    TableModule,
    FormsModule,
    AccordionModule,
    CommonModule,
    RouterModule,
    PaginatorModule,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './return-list-wh.component.html',
  styleUrl: './return-list-wh.component.scss'
})
export class ReturnListWhComponent {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/38/MONOGRAM_LOGO_Color_200x200_v.png',
    orderNo: 'PO123',
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
    totalInWords: ''
  };
  email: string | null = null;
  productBy: string | null = null;
  userProfile: any;
  showFlag: boolean = false;
  tableData: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  isNewPO: boolean = false;
  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];


  constructor(private route: ActivatedRoute, private authService: AuthService, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.userProfile.email

  
        this.getAllData();
    
    });
  }

  getAllData() {
    this.showFlag = false;
    this.authService.get(`wholesaler-return?email=${this.authService.currentUserValue.email}`).subscribe((res: any) => {
      this.tableData = res.results;
      console.log(res)
      this.totalResults = res.totalResults;
    })
  }

  patchData(data: any) {
    this.purchaseOrder = data;
    this.isNewPO = false;  // Set to false to hide the "Generate PO" button
    this.showFlag = true;  // Show the purchase order details
  }

  generatePO(obj: any) {
    this.authService.post('product-order', obj).subscribe((res: any) => {
      this.communicationService.showNotification('snackbar-success', 'PO Generated Successfully .. !', 'bottom', 'center');
      this.getAllData();
      this.isNewPO = false;  // After generating, ensure the button is hidden
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllData();
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


  printPurchaseOrder(): void {
    const data = document.getElementById('purchase-order');
    if (data) {
      html2canvas(data, {
        scale: 3,  // Adjust scale for better quality
        useCORS: true,
      }).then((canvas) => {
        const imgWidth = 208;  // A4 page width in mm
        const pageHeight = 295;  // A4 page height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
  
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');  // Create new PDF
        const margin = 10;  // Margin for PDF
        let position = margin;
  
        // Add first page
        pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
        heightLeft -= pageHeight;
  
        // Loop over content to add remaining pages if content exceeds one page
        while (heightLeft > 0) {
          pdf.addPage();  // Add new page
          position = margin - heightLeft;  // Position for the next page
          pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
          heightLeft -= pageHeight;
        }
  
        // Save PDF file
        pdf.save('purchase-order.pdf');
      }).catch((error) => {
        console.error("Error generating PDF:", error);
      });
    } else {
      console.error("Element with id 'purchase-order' not found.");
    }
  }
  
}