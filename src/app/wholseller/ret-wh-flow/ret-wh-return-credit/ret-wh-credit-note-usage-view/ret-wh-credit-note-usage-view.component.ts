import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-ret-wh-credit-note-usage-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    CardModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './ret-wh-credit-note-usage-view.component.html',
  styleUrl: './ret-wh-credit-note-usage-view.component.scss'
})
export class RetWhCreditNoteUsageViewComponent implements OnInit {

  walletId: string = '';
  walletData: any = null;
  transactions: any[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private communicationService: CommunicationService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.walletId = params['id'];
      if (this.walletId) {
        this.getWalletDetails();
      }
    });
  }

  getWalletDetails() {
    this.isLoading = true;
    const url = `w-to-r-wallet/${this.walletId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        console.log('API Response:', res);

        if (res && res.id) {
          this.walletData = res;
          this.transactions = this.walletData.transactions || [];
          console.log('Wallet Details:', this.walletData);
          console.log('Transactions:', this.transactions);
        } else {
          console.error('Invalid response structure:', res);
          this.communicationService.customError1('Invalid data format received');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching wallet details:', error);
        this.communicationService.customError1('Failed to load wallet details');
        this.isLoading = false;
      }
    );
  }

  getTransactionTypeClass(type: string): string {
    return type?.toLowerCase() === 'credit' ? 'success' : 'danger';
  }

  getTransactionTypeIcon(type: string): string {
    return type?.toLowerCase() === 'credit' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle';
  }

  goBack(): void {
    this.location.back();
  }

  downloadPDF() {
    if (!this.walletData) {
      this.communicationService.customError1('No data available to download');
      return;
    }

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('Credit Note Usage Report', 14, 20);

      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.line(14, 23, pageWidth - 14, 23);

      // Wallet Summary
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Wallet Summary', 14, 32);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Left Column
      doc.text('Retailer Email:', 14, 40);
      doc.setFont('helvetica', 'bold');
      doc.text(this.walletData.retailerEmail, 50, 40);

      doc.setFont('helvetica', 'normal');
      doc.text('Wholesaler Email:', 14, 47);
      doc.setFont('helvetica', 'bold');
      doc.text(this.walletData.wholesalerEmail, 50, 47);

      doc.setFont('helvetica', 'normal');
      doc.text('Currency:', 14, 54);
      doc.setFont('helvetica', 'bold');
      doc.text(this.walletData.currency, 50, 54);

      // Right Column
      doc.setFont('helvetica', 'normal');
      doc.text('Current Balance:', 115, 40);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 167, 69);
      doc.text(`Rs ${this.walletData.balance.toFixed(2)}`, 155, 40);

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Credited:', 115, 47);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(`Rs ${this.walletData.totalCredited.toFixed(2)}`, 155, 47);

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Debited:', 115, 54);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text(`Rs ${this.walletData.totalDebited.toFixed(2)}`, 155, 54);

      // Separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(14, 63, pageWidth - 14, 63);

      // Transaction Table
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transaction History (${this.transactions.length} Transactions)`, 14, 71);

      const tableData = this.transactions.map((transaction, index) => {
        const date = new Date(transaction.createdAt);
        const formattedDate = date.toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit', hour12: true
        });

        return [
          (index + 1).toString(),
          formattedDate + '\n' + formattedTime,
          transaction.type.toUpperCase(),
          'Rs ' + transaction.amount.toFixed(2),
          'Rs ' + transaction.balanceAfter.toFixed(2),
          transaction.creditNoteNumber?.toString() || '-',
          (transaction.creditInvoiceNumber || transaction.debitInvoiceNumber)?.toString() || '-',
          transaction.description
        ];
      });

      autoTable(doc, {
        startY: 76,
        head: [['#', 'Date & Time', 'Type', 'Amount', 'Balance', 'CN#', 'Inv#', 'Description']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 2
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          valign: 'top',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 24, halign: 'center', fontSize: 7 },
          2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
          3: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 10, halign: 'center' },
          6: { cellWidth: 10, halign: 'center' },
          7: { cellWidth: 66, halign: 'left', fontSize: 7 }
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 2 && data.cell.section === 'body') {
            const cellValue = data.cell.text[0];
            if (cellValue === 'CREDIT') {
              data.cell.styles.textColor = [40, 167, 69];
            } else if (cellValue === 'DEBIT') {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
          if (data.column.index === 4 && data.cell.section === 'body') {
            data.cell.styles.textColor = [40, 167, 69];
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 3 && data.cell.section === 'body') {
            const rowType = tableData[data.row.index][2];
            if (rowType === 'CREDIT') {
              data.cell.styles.textColor = [40, 167, 69];
            } else {
              data.cell.styles.textColor = [220, 53, 69];
            }
          }
        },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          const currentPage = doc.getCurrentPageInfo().pageNumber;

          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setFont('helvetica', 'italic');

          doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, pageHeight - 8);
          doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 35, pageHeight - 8);
        }
      });

      const sanitizedEmail = this.walletData.retailerEmail.replace('@', '_at_').replace(/\./g, '_');
      const fileName = `Credit_Note_Usage_${sanitizedEmail}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      this.communicationService.customSuccess1('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.communicationService.customError1('Failed to generate PDF');
    }
  }
}
