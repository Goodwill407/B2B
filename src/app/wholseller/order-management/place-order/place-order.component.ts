import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-place-order',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    PaginatorModule,
  ],
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent {
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
  showFlag: boolean = false;
  tableData: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  isNewPO: boolean = false;

  constructor(private route: ActivatedRoute, private authService: AuthService, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.email = params.get('email');
      this.productBy = params.get('productBy');

      if (this.email && this.productBy) {
        this.authService.get(`cart/place-order/products?email=${this.email}&productBy=${this.productBy}`)
          .subscribe((res: any) => {
            const response = res[0];
            this.purchaseOrder = {
              ...this.purchaseOrder,
              supplierName: response.manufacturer.companyName,
              supplierDetails: response.manufacturer.fullName,
              supplierAddress: response.manufacturer.address + ', ' + response.manufacturer.city + ', ' + response.manufacturer.state + ' - ' + response.manufacturer.pinCode,
              supplierContact: `${response.manufacturer.mobNumber}`,
              supplierEmail: `${response.manufacturer.email}`,
              supplierGSTIN: response.manufacturer.GSTIN || 'GSTIN_NOT_PROVIDED',
              buyerName: response.wholesaler.companyName,
              logoUrl: this.authService.cdnPath + response.wholesaler.profileImg,
              buyerAddress: response.wholesaler.address + ', ' + response.wholesaler.city + ', ' + response.wholesaler.state + ' - ' + response.wholesaler.pinCode,
              buyerPhone: response.wholesaler.mobNumber,
              buyerEmail: response.wholesaler.email,
              buyerDetails: response.wholesaler.fullName,
              buyerGSTIN: response.wholesaler.GSTIN || 'GSTIN_NOT_PROVIDED',
              poDate: new Date().toLocaleDateString(),
              poNumber: response.orderNumber,
              products: response.products.map((product: any, index: number) => {
                const gst = (product.productId.setOfManPrice * 0.18).toFixed(2);
                return {
                  srNo: index + 1,
                  name: product.productId.productTitle,
                  designNo: product.productId.designNumber,
                  qty: product.quantity,
                  rate: product.productId.setOfManPrice,
                  mrp: product.productId.setOfMRP,
                  taxableValue: product.productId.setOfManPrice * product.quantity,
                  gst: gst,
                  total: (product.productId.setOfManPrice * product.quantity + parseFloat(gst)).toFixed(2),
                };
              }),
              totalRate: response.products.reduce((sum: number, product: any) => sum + product.productId.setOfManPrice * product.quantity, 0).toFixed(2),
              totalAmount: response.products.reduce((sum: number, product: any) => sum + product.productId.setOfManPrice * product.quantity + parseFloat((product.productId.setOfManPrice * 0.18).toFixed(2)), 0).toFixed(2),
              totalGST: response.products.reduce((sum: number, product: any) => sum + parseFloat((product.productId.setOfManPrice * 0.18).toFixed(2)), 0).toFixed(2),
            };
            this.purchaseOrder.roundedOffTotal = Math.round(parseFloat(this.purchaseOrder.totalAmount));
            this.purchaseOrder.totalInWords = this.convertNumberToWords(parseFloat(this.purchaseOrder.roundedOffTotal)) + " Rupees Only";
            this.isNewPO = true;  // Set this flag to true for new orders
            this.showFlag = true;
          },(error)=>{
            this.communicationService.customError1(error.error.message);
          });
      }
      else {
        this.getAllData();
      }
    });
  }

  getAllData() {
    this.showFlag = false;
    this.authService.get(`product-order?buyerEmail=${this.authService.currentUserValue.email}&page=${this.page}&limit=${this.limit}`).subscribe((res: any) => {
      this.tableData = res.results;
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
