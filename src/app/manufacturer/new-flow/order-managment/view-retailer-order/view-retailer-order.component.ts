import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { statusAllPoDisplayPipe } from 'app/statusAll-po';

@Component({
  selector: 'app-view-retailer-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
    RouterModule,
    TooltipModule,
    MatTabsModule,
    statusAllPoDisplayPipe
  ],
  templateUrl: './view-retailer-order.component.html',
  styleUrl: './view-retailer-order.component.scss'
})
export class ViewRetailerOrderComponent {
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

  // Data arrays
  pendingData: any[] = [];
  partialData: any[] = [];
  updatedData: any[] = [];

  // Pagination variables
  firstPending: number = 0;
  firstPartial: number = 0;
  firstUpdated: number = 0;

  totalPendingResults: number = 0;
  totalPartialResults: number = 0;
  totalUpdatedResults: number = 0;

  limit = 10;
  email: string | null = null;
  productBy: string | null = null;
  userProfile: any;
  showFlag: boolean = false;
  isNewPO: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
      this.userProfile.email;

      // Load all data on init
      this.getPendingData();
      this.getPartialData();
      this.getUpdatedData();
    });
  }

  // Individual methods for each statusAll
  getPendingData() {
    const skip = this.firstPending;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&statusAll=pending&skip=${skip}&limit=${limit}`) //&sortBy=createdAt:desc
      .subscribe((res: any) => {
        this.pendingData = res.results;
        this.totalPendingResults = res.totalResults;
      });
  }

  getPartialData() {
    const skip = this.firstPartial;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=m_partial_delivery&skip=${skip}&limit=${limit}`)
      .subscribe((res: any) => {
        this.partialData = res.results;
        this.totalPartialResults = res.totalResults;
      });
  }

  getUpdatedData() {
    const skip = this.firstUpdated;
    const limit = this.limit;

    this.authService.get(`po-retailer-to-manufacture?manufacturerEmail=${this.authService.currentUserValue.email}&sortBy=createdAt:desc&statusAll=m_order_confirmed&skip=${skip}&limit=${limit}`)
      .subscribe((res: any) => {
        this.updatedData = res.results;
        this.totalUpdatedResults = res.totalResults;
      });
  }

  // Pagination handlers
  onPendingPageChange(event: any) {
    this.firstPending = event.first;
    this.limit = event.rows;
    this.getPendingData();
  }

  onPartialPageChange(event: any) {
    this.firstPartial = event.first;
    this.limit = event.rows;
    this.getPartialData();
  }

  onUpdatedPageChange(event: any) {
    this.firstUpdated = event.first;
    this.limit = event.rows;
    this.getUpdatedData();
  }

  // patchData(data: any) {
  //   this.purchaseOrder = data;
  //   this.isNewPO = false;
  //   this.showFlag = true;
  // }

  // generatePO(obj: any) {
  //   this.authService.post('product-order', obj).subscribe((res: any) => {
  //     this.communicationService.showNotification('snackbar-success', 'PO Generated Successfully .. !', 'bottom', 'center');
  //     // Refresh all data
  //     this.getPendingData();
  //     this.getPartialData();
  //     this.getUpdatedData();
  //     this.isNewPO = false;
  //   });
  // }

  // convertNumberToWords(amount: number): string {
  //   const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  //   const teens = ["Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  //   const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  //   const thousands = ["", "Thousand", "Million", "Billion"];

  //   if (amount === 0) return "Zero";

  //   let words = '';

  //   function numberToWords(num: number, index: number): string {
  //     let str = '';
  //     if (num > 99) {
  //       str += units[Math.floor(num / 100)] + " Hundred ";
  //       num %= 100;
  //     }
  //     if (num > 10 && num < 20) {
  //       str += teens[num - 11] + " ";
  //     } else {
  //       str += tens[Math.floor(num / 10)] + " ";
  //       str += units[num % 10] + " ";
  //     }
  //     if (str.trim().length > 0) {
  //       str += thousands[index] + " ";
  //     }
  //     return str;
  //   }

  //   let i = 0;
  //   while (amount > 0) {
  //     words = numberToWords(amount % 1000, i) + words;
  //     amount = Math.floor(amount / 1000);
  //     i++;
  //   }

  //   return words.trim();
  // }

  // printPurchaseOrder(): void {
  //   const data = document.getElementById('purchase-order');
  //   if (data) {
  //     html2canvas(data, {
  //       scale: 3,
  //       useCORS: true,
  //     }).then((canvas) => {
  //       const imgWidth = 208;
  //       const pageHeight = 295;
  //       const imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       let heightLeft = imgHeight;

  //       const contentDataURL = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //       const margin = 10;
  //       let position = margin;

  //       pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
  //       heightLeft -= pageHeight;

  //       while (heightLeft > 0) {
  //         pdf.addPage();
  //         position = margin - heightLeft;
  //         pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth - 2 * margin, imgHeight);
  //         heightLeft -= pageHeight;
  //       }

  //       pdf.save('purchase-order.pdf');
  //     }).catch((error) => {
  //       console.error("Error generating PDF:", error);
  //     });
  //   } else {
  //     console.error("Element with id 'purchase-order' not found.");
  //   }
  // }
}
