import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';

// Interfaces
interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  accountType: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  swiftCode?: string;
  upiId: string;
  bankAddress: string;
}

interface DeliveryItem {
  designNumber: string;
  colour: string;
  colourName: string;
  colourImage: string;
  size: string;
  quantity: number;
  productType: string;
  gender: string;
  clothing: string;
  hsnCode: string;
  hsnGst: number;
  hsnDescription: string;
  status: string;
  brandName: string;
  price: number;
}

@Component({
  selector: 'app-ret-wh-invoice-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, RouterModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './ret-wh-invoice-view.component.html',
  styleUrl: './ret-wh-invoice-view.component.scss'
})
export class RetWhInvoiceViewComponent implements OnInit {

  invoiceData: any = {};
  responseData: any;
  invoiceId: string;
  isIntraState: boolean = false;
  loading: boolean = true;

  isRetailer: boolean = false;
  currentUserRole: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe
  ) {
    this.invoiceId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log(this.invoiceId,"ytdhdyh");
  }

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || '';
    this.isRetailer = this.currentUserRole === 'retailer';
    this.getInvoiceDetails();
  }

  getInvoiceDetails() {
    this.loading = true;
    // ✅ Updated: wholesaler-to-retailer API
    const url = `pi-wholesaler-to-retailer/${this.invoiceId}`;

    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        this.mapInvoiceData(res);
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching invoice:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load invoice details');
      }
    );
  }

  mapInvoiceData(data: any) {
    this.invoiceData = {
      // Invoice basic info
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.invoiceDate).toLocaleDateString(),
      poNumber: data.poNumber,
      statusAll: data.statusAll,

      // ✅ Wholesaler (Seller) details — updated from manufacturer
      sellerName: data.wholesaler.companyName,
      sellerFullName: data.wholesaler.fullName,
      sellerAddress: `${data.wholesaler.address}, ${data.wholesaler.pinCode} - ${data.wholesaler.state}`,
      sellerContact: data.wholesaler.mobNumber,
      sellerEmail: data.wholesaler.email,
      sellerGSTIN: data.wholesaler.GSTIN,
      sellerPAN: this.extractPanFromGstin(data.wholesaler.GSTIN),

      // Retailer (Buyer) details — same as before
      buyerName: data.retailer.companyName,
      buyerFullName: data.retailer.fullName,
      buyerAddress: data.retailer.address,
      buyerContact: data.retailer.mobNumber,
      buyerEmail: data.retailer.email,
      buyerGSTIN: data.retailer.GSTIN,
      buyerPAN: this.extractPanFromGstin(data.retailer.GSTIN),
      buyerLogo: data.retailer.logo,

      // Items and amounts
      deliveryItems: data.deliveryItems || [],
      totalQuantity: data.totalQuantity,
      totalAmount: data.totalAmount,
      discountApplied: data.discountApplied,
      finalAmount: data.finalAmount,

      // Additional details
      transportDetails: data.transportDetails,
      bankDetails: data.bankDetails
    };

    this.updateStateType();
  }

  updateStateType() {
    // ✅ Updated: wholesaler state instead of manufacturer
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const sellerState = this.responseData?.wholesaler?.state?.trim().toLowerCase();
    this.isIntraState = buyerState && sellerState && (buyerState === sellerState);
  }

  getItemPrice(item: any): number {
    if (item.price) {
      return parseFloat(item.price.toString());
    }
    return 0;
  }

  getGstAmounts(item: any) {
    const quantity = item.quantity || 0;
    const rate = this.getItemPrice(item);
    const gstRate = Number(item.hsnGst) || 0;

    const discountPercent = Number(this.responseData?.retailer?.productDiscount) || 0;
    const discountedRate = rate - (rate * discountPercent / 100);

    const taxable = quantity * discountedRate;

    let cgst = 0, sgst = 0, igst = 0;

    if (gstRate > 0) {
      if (this.isIntraState) {
        cgst = (taxable * gstRate) / 200;
        sgst = (taxable * gstRate) / 200;
      } else {
        igst = (taxable * gstRate) / 100;
      }
    }

    const totalWithGst = taxable + cgst + sgst + igst;

    return {
      originalRate: rate,
      discountedRate: discountedRate,
      taxable: Number(taxable.toFixed(2)),
      gstRate,
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      totalWithGst: Number(totalWithGst.toFixed(2))
    };
  }

  get discountPercentage(): number {
    return Number(this.responseData?.retailer?.productDiscount) || 0;
  }

  get itemTotals() {
    let totalQty = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalWithGST = 0;

    for (const item of this.invoiceData.deliveryItems || []) {
      const gst = this.getGstAmounts(item);
      totalQty += Number(item.quantity) || 0;
      totalTaxable += gst.taxable;
      totalCGST += gst.cgst;
      totalSGST += gst.sgst;
      totalIGST += gst.igst;
      totalWithGST += gst.totalWithGst;
    }

    return {
      totalQty,
      totalTaxable: Number(totalTaxable.toFixed(2)),
      totalCGST: Number(totalCGST.toFixed(2)),
      totalSGST: Number(totalSGST.toFixed(2)),
      totalIGST: Number(totalIGST.toFixed(2)),
      totalWithGST: Number(totalWithGST.toFixed(2))
    };
  }

  get totalGSTAmount(): number {
    const totals = this.itemTotals;
    return Number((totals.totalCGST + totals.totalSGST + totals.totalIGST).toFixed(2));
  }

  get finalAmountAfterDeductions(): number {
    const totals = this.itemTotals;
    const discount = Number(this.invoiceData.discountApplied) || 0;
    const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
    return Number((totals.totalWithGST - discount - creditNote).toFixed(2));
  }

  get totalAmountInclTax(): number {
    const totals = this.itemTotals;
    return Number((totals.totalTaxable + totals.totalCGST + totals.totalSGST + totals.totalIGST).toFixed(2));
  }

  get totalPayAmount(): number {
    const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
    return Number((this.totalAmountInclTax - creditNote).toFixed(2));
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  calculateActualDiscount(): number {
    let totalDiscount = 0;
    for (const item of this.invoiceData.deliveryItems || []) {
      const quantity = item.quantity || 0;
      const originalRate = this.getItemPrice(item);
      const discountPercent = this.discountPercentage;
      const itemDiscount = (originalRate * discountPercent / 100) * quantity;
      totalDiscount += itemDiscount;
    }
    return Number(totalDiscount.toFixed(2));
  }

  // ===================== PDF GENERATION =====================
  async downloadInvoice() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    const margin = 10;
    const contentWidth = pageWidth - (margin * 2);

    // Header Section
    const headerHeight = 25;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, contentWidth, headerHeight, 'F');
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, contentWidth, headerHeight);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(this.invoiceData.sellerName, margin + 5, yPosition + 8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.invoiceData.sellerAddress, margin + 5, yPosition + 13);
    doc.text(`Ph: ${this.invoiceData.sellerContact} | Email: ${this.invoiceData.sellerEmail}`, margin + 5, yPosition + 18);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 130, 180);
    doc.text('TAX INVOICE', pageWidth - margin - 5, yPosition + 8, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`GSTIN: ${this.invoiceData.sellerGSTIN}`, pageWidth - margin - 5, yPosition + 15, { align: 'right' });

    doc.setFontSize(7);
    doc.text('ORIGINAL FOR RECIPIENT', pageWidth - margin - 5, yPosition + 20, { align: 'right' });

    yPosition += headerHeight + 10;

    // Customer and Invoice Details
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);

    const customerBoxHeight = 30;
    doc.rect(margin, yPosition, contentWidth * 0.65, customerBoxHeight);
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, yPosition, contentWidth * 0.65, customerBoxHeight, 'F');
    doc.rect(margin, yPosition, contentWidth * 0.65, customerBoxHeight);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Detail', margin + 3, yPosition + 6);

    doc.setFontSize(8);
    let customerY = yPosition + 10;
    const customerLines = [
      `Company: ${this.invoiceData.buyerName}`,
      `Address: ${this.invoiceData.buyerAddress}`,
      `Mobile: ${this.invoiceData.buyerContact}`,
      `GST: ${this.invoiceData.buyerGSTIN}`,
      `Place: ${this.responseData?.retailer?.state || ''} (${this.responseData?.retailer?.pinCode || ''})`
    ];

    customerLines.forEach(line => {
      doc.setFont('helvetica', 'normal');
      doc.text(line, margin + 3, customerY);
      customerY += 3.5;
    });

    const invoiceBoxX = margin + contentWidth * 0.65 + 2;
    const invoiceBoxWidth = contentWidth * 0.35 - 2;
    doc.rect(invoiceBoxX, yPosition, invoiceBoxWidth, customerBoxHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let invoiceY = yPosition + 6;
    const invoiceDetails = [
      ['Invoice No:', this.invoiceData.invoiceNumber],
      ['Invoice Date:', this.invoiceData.invoiceDate],
      ['PO No:', this.invoiceData.poNumber.toString()]
    ];

    invoiceDetails.forEach(([label, value]) => {
      doc.text(label, invoiceBoxX + 2, invoiceY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, pageWidth - margin - 3, invoiceY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      invoiceY += 4.5;
    });

    yPosition += customerBoxHeight + 10;

    // Items Table
    const totals = this.itemTotals;
    let tableHeaders: string[];
    let tableData: any[][];

    if (this.isIntraState) {
      tableHeaders = ['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'Total'];
      tableData = this.invoiceData.deliveryItems.map((item: any, index: number) => {
        const gstAmounts = this.getGstAmounts(item);
        const rate = gstAmounts.discountedRate;
        return [
          (index + 1).toString(),
          `${item.designNumber}\nBrand: ${item.brandName}\n${item.gender} ${item.clothing} - ${item.colourName} - ${item.size}`,
          item.hsnCode || '',
          item.quantity.toString(),
          rate.toFixed(2),
          gstAmounts.taxable.toFixed(2),
          `${(item.hsnGst / 2 || 0).toFixed(1)}%`,
          gstAmounts.cgst.toFixed(2),
          `${(item.hsnGst / 2 || 0).toFixed(1)}%`,
          gstAmounts.sgst.toFixed(2),
          gstAmounts.totalWithGst.toFixed(2)
        ];
      });
      tableData.push([
        '', 'Total', '', totals.totalQty.toString(), '',
        totals.totalTaxable.toFixed(2), '', totals.totalCGST.toFixed(2),
        '', totals.totalSGST.toFixed(2), totals.totalWithGST.toFixed(2)
      ]);
    } else {
      tableHeaders = ['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'IGST %', 'IGST Amt', 'Total'];
      tableData = this.invoiceData.deliveryItems.map((item: any, index: number) => {
        const gstAmounts = this.getGstAmounts(item);
        const rate = gstAmounts.discountedRate;
        return [
          (index + 1).toString(),
          `${item.designNumber}\nBrand: ${item.brandName}\n${item.gender} ${item.clothing} - ${item.colourName} - ${item.size}`,
          item.hsnCode || '',
          item.quantity.toString(),
          rate.toFixed(2),
          gstAmounts.taxable.toFixed(2),
          `${(item.hsnGst || 0).toFixed(1)}%`,
          gstAmounts.igst.toFixed(2),
          gstAmounts.totalWithGst.toFixed(2)
        ];
      });
      tableData.push([
        '', 'Total', '', totals.totalQty.toString(), '',
        totals.totalTaxable.toFixed(2), '', totals.totalIGST.toFixed(2),
        totals.totalWithGST.toFixed(2)
      ]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7, cellPadding: 1,
        lineColor: [180, 180, 180], lineWidth: 0.2,
        textColor: [0, 0, 0], overflow: 'linebreak',
        halign: 'center', valign: 'middle'
      },
      headStyles: {
        fillColor: [230, 230, 230], textColor: [0, 0, 0],
        fontStyle: 'bold', fontSize: 7, halign: 'center', cellPadding: 1
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { halign: 'center', minCellWidth: 8 },
        1: { halign: 'left', minCellWidth: 35 },
        2: { halign: 'center', minCellWidth: 12 },
        3: { halign: 'center', minCellWidth: 10 },
        4: { halign: 'right', minCellWidth: 12 },
        5: { halign: 'right', minCellWidth: 16 },
        6: { halign: 'center', minCellWidth: 10 },
        7: { halign: 'right', minCellWidth: 14 },
        8: { halign: this.isIntraState ? 'center' : 'right', minCellWidth: this.isIntraState ? 10 : 18 },
        ...(this.isIntraState && {
          9: { halign: 'right', minCellWidth: 14 },
          10: { halign: 'right', minCellWidth: 18 }
        })
      },
      tableWidth: 'auto',
      margin: { left: margin + 2, right: margin + 2 },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 7;
        }
      },
      showHead: 'everyPage',
      pageBreak: 'auto',
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    if (pageHeight - yPosition - margin < 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Financial Summary Section
    const summaryBoxHeight = 35;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, contentWidth * 0.6, summaryBoxHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Total in words', margin + 3, yPosition + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const amountInWords = this.amountInWordsPipe.transform(this.totalPayAmount);
    const wrappedText = doc.splitTextToSize(amountInWords, contentWidth * 0.55);
    doc.text(wrappedText, margin + 3, yPosition + 12);

    if (this.discountPercentage > 0) {
      doc.setFontSize(7);
      doc.setTextColor(34, 139, 34);
      doc.setFont('helvetica', 'bold');
      doc.text(`Note: ${this.discountPercentage}% discount applied on product rates (Approx. Total Discount: Rs.${this.calculateActualDiscount().toFixed(2)})`, margin + 3, yPosition + 25);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
    }

    const rightBoxX = margin + contentWidth * 0.6 + 2;
    const rightBoxWidth = contentWidth * 0.4 - 2;
    doc.rect(rightBoxX, yPosition, rightBoxWidth, summaryBoxHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let summaryY = yPosition + 6;

    const summaryItems: string[][] = [
      ['Taxable Amount', totals.totalTaxable.toFixed(2)],
      [`Add: ${this.isIntraState ? 'CGST + SGST' : 'IGST'}`, this.totalGSTAmount.toFixed(2)],
      ['Total (Incl. Tax)', this.totalAmountInclTax.toFixed(2)]
    ];

    if ((this.responseData?.totalCreditNoteAmountUsed || 0) > 0) {
      summaryItems.push(['Less: Credit Note', (this.responseData?.totalCreditNoteAmountUsed || 0).toFixed(2)]);
    }

    summaryItems.forEach(([label, amount]) => {
      doc.text(label, rightBoxX + 2, summaryY);
      doc.text(amount, pageWidth - margin - 3, summaryY, { align: 'right' });
      summaryY += 3;
    });

    summaryY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 32, 128);
    doc.text('Total Pay Amount', rightBoxX + 2, summaryY);
    doc.text(`Rs.${this.totalPayAmount.toFixed(2)}`, pageWidth - margin - 3, summaryY, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    yPosition += summaryBoxHeight + 15;

    if (pageHeight - yPosition - margin < 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Bank Details
    const bottomBoxHeight = 25;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(margin, yPosition, contentWidth * 0.6, bottomBoxHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Bank Details', margin + 2, yPosition + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    let bankY = yPosition + 9;
    const bankDetails = [
      `Account Holder Name: ${this.invoiceData.bankDetails.accountHolderName}`,
      `Bank: ${this.invoiceData.bankDetails.bankName}`,
      `Branch: ${this.invoiceData.bankDetails.branchName}`,
      `A/c: ${this.invoiceData.bankDetails.accountNumber}`,
      `IFSC: ${this.invoiceData.bankDetails.ifscCode}`
    ];

    bankDetails.forEach(detail => {
      doc.text(detail, margin + 2, bankY);
      bankY += 3;
    });

    yPosition += bottomBoxHeight + 8;

    // Transport Details
    if (this.invoiceData.transportDetails) {
      if (pageHeight - yPosition - margin < 20) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Transport Details', margin, yPosition);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      yPosition += 4;
      doc.text(`Transport: ${this.invoiceData.transportDetails.modeOfTransport} via ${this.invoiceData.transportDetails.transporterCompanyName}`, margin, yPosition);

      if (this.invoiceData.transportDetails.vehicleNumber) {
        yPosition += 3;
        doc.text(`Vehicle: ${this.invoiceData.transportDetails.vehicleNumber}`, margin, yPosition);
      }
      if (this.invoiceData.transportDetails.trackingId) {
        yPosition += 3;
        doc.text(`Tracking ID: ${this.invoiceData.transportDetails.trackingId}`, margin, yPosition);
      }
      if (this.invoiceData.transportDetails.contactPersonName) {
        yPosition += 3;
        doc.text(`Contact: ${this.invoiceData.transportDetails.contactPersonName} (${this.invoiceData.transportDetails.contactNumber})`, margin, yPosition);
      }

      yPosition += 6;
    }

    // Terms and Conditions
    if (pageHeight - yPosition - margin < 15) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms and Conditions', margin, yPosition);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    yPosition += 4;
    const terms = [
      'Our Responsibility Ceases as soon as goods leaves our Premises.',
      'Goods once sold will not taken back.',
      'Delivery Ex-Premises.'
    ];
    terms.forEach(term => {
      doc.text(term, margin, yPosition);
      yPosition += 3;
    });

    // Disclaimer
    if (pageHeight - yPosition - margin < 10) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated invoice and does not require signature.', pageWidth / 2, yPosition, { align: 'center' });

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`Invoice_${this.invoiceData.invoiceNumber}_${timestamp}.pdf`);
  }

  navigateBack() {
    this.location.back();
  }

  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) return '';
    try {
      return gstin.substring(2, 12).toUpperCase();
    } catch (error) {
      return '';
    }
  }

  confirmReceived() {
    const invNo = this.invoiceData?.invoiceNumber || '';
    const message = `Have you received the products of this invoice no. ${invNo}?`;
    const ok = window.confirm(message);
    if (!ok) return;
    this.markInvoiceReceived();
  }

  markInvoiceReceived() {
    // ✅ Updated: wholesaler-to-retailer API
    const url = `pi-wholesaler-to-retailer/${this.invoiceId}`;
    const payload: any = {
      statusAll: 'delivered',
      invoiceRecievedDate: new Date().toISOString()
    };

    this.loading = true;
    (this.authService as any).patchpimage(url, payload).subscribe(
      (res: any) => {
        this.communicationService.customSuccess1('Invoice marked as received');
        this.responseData = {
          ...this.responseData,
          statusAll: 'delivered',
          invoiceRecievedDate: payload.invoiceRecievedDate
        };
        this.invoiceData = {
          ...this.invoiceData,
          statusAll: 'delivered',
          invoiceRecievedDate: payload.invoiceRecievedDate
        };
        this.loading = false;
      },
      (error: any) => {
        console.error('Error updating invoice status:', error);
        this.communicationService.customError1('Failed to update invoice status');
        this.loading = false;
      }
    );
  }
}
