import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';

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
  selector: 'app-mfg-whl-invoice-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    RouterModule,
    IndianCurrencyPipe,
    AmountInWordsPipe,
  ],
  templateUrl: './mfg-whl-invoice-view.component.html',
  styleUrl: './mfg-whl-invoice-view.component.scss',
})
export class MfgWhlInvoiceViewComponent implements OnInit {

  invoiceData: any = {};
  responseData: any;
  invoiceId: string;
  isIntraState: boolean = false;
  loading: boolean = true;

  isWholesaler: boolean = false;
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
  }

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || '';
    this.isWholesaler = this.currentUserRole === 'wholesaler';
    this.getInvoiceDetails();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  getInvoiceDetails() {
    this.loading = true;
    const url = `pi-manufacture-to-wholesaler/${this.invoiceId}`;

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
      invoiceNumber:  data.invoiceNumber,
      invoiceDate:    new Date(data.invoiceDate).toLocaleDateString(),
      poNumber:       data.poNumber,
      statusAll:      data.statusAll,

      // Manufacturer = Seller
      sellerName:     data.manufacturer.companyName,
      sellerFullName: data.manufacturer.fullName,
      sellerAddress:  `${data.manufacturer.address}, ${data.manufacturer.pinCode} - ${data.manufacturer.state}`,
      sellerContact:  data.manufacturer.mobNumber,
      sellerEmail:    data.manufacturer.email,
      sellerGSTIN:    data.manufacturer.GSTIN,
      sellerPAN:      this.extractPanFromGstin(data.manufacturer.GSTIN),

      // Wholesaler = Buyer
      buyerName:      data.wholesaler.companyName,
      buyerFullName:  data.wholesaler.fullName,
      buyerAddress:   data.wholesaler.address,
      buyerContact:   data.wholesaler.mobNumber,
      buyerEmail:     data.wholesaler.email,
      buyerGSTIN:     data.wholesaler.GSTIN,
      buyerPAN:       this.extractPanFromGstin(data.wholesaler.GSTIN),
      buyerLogo:      data.wholesaler.logo,

      deliveryItems:    data.deliveryItems || [],
      totalQuantity:    data.totalQuantity,
      totalAmount:      data.totalAmount,
      discountApplied:  data.discountApplied,
      finalAmount:      data.finalAmount,

      transportDetails: data.transportDetails,
      bankDetails:      data.bankDetails,
    };

    this.updateStateType();
  }

  updateStateType() {
    const buyerState   = this.responseData?.wholesaler?.state?.trim().toLowerCase();
    const sellerState  = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState  = !!(buyerState && sellerState && buyerState === sellerState);
  }

  // ─── Calculations ────────────────────────────────────────────────────────────

  getItemPrice(item: any): number {
    if (item.price) return parseFloat(item.price.toString());
    return 0;
  }

  getGstAmounts(item: any) {
    const quantity        = item.quantity || 0;
    const rate            = this.getItemPrice(item);
    const gstRate         = Number(item.hsnGst) || 0;
    const discountPercent = Number(this.responseData?.wholesaler?.productDiscount) || 0;
    const discountedRate  = rate - (rate * discountPercent / 100);
    const taxable         = quantity * discountedRate;

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
      originalRate:   rate,
      discountedRate: isNaN(discountedRate) ? 0 : discountedRate,
      taxable:        Number(taxable.toFixed(2)),
      gstRate,
      cgst:           Number(cgst.toFixed(2)),
      sgst:           Number(sgst.toFixed(2)),
      igst:           Number(igst.toFixed(2)),
      totalWithGst:   Number(totalWithGst.toFixed(2)),
    };
  }

  get discountPercentage(): number {
    return Number(this.responseData?.wholesaler?.productDiscount) || 0;
  }

  get itemTotals() {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0;
    let totalSGST = 0, totalIGST = 0, totalWithGST = 0;

    for (const item of this.invoiceData.deliveryItems || []) {
      const gst   = this.getGstAmounts(item);
      totalQty     += Number(item.quantity) || 0;
      totalTaxable += gst.taxable;
      totalCGST    += gst.cgst;
      totalSGST    += gst.sgst;
      totalIGST    += gst.igst;
      totalWithGST += gst.totalWithGst;
    }

    return {
      totalQty,
      totalTaxable:  Number(totalTaxable.toFixed(2)),
      totalCGST:     Number(totalCGST.toFixed(2)),
      totalSGST:     Number(totalSGST.toFixed(2)),
      totalIGST:     Number(totalIGST.toFixed(2)),
      totalWithGST:  Number(totalWithGST.toFixed(2)),
    };
  }

  get totalGSTAmount(): number {
    const t = this.itemTotals;
    return Number((t.totalCGST + t.totalSGST + t.totalIGST).toFixed(2));
  }

  get totalAmountInclTax(): number {
    const t = this.itemTotals;
    return Number((t.totalTaxable + t.totalCGST + t.totalSGST + t.totalIGST).toFixed(2));
  }

  get totalPayAmount(): number {
    const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
    return Number((this.totalAmountInclTax - creditNote).toFixed(2));
  }

  get finalAmountAfterDeductions(): number {
    const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
    return Number((this.itemTotals.totalWithGST - creditNote).toFixed(2));
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  calculateActualDiscount(): number {
    let totalDiscount = 0;
    for (const item of this.invoiceData.deliveryItems || []) {
      const qty             = item.quantity || 0;
      const originalRate    = this.getItemPrice(item);
      const discountPercent = this.discountPercentage;
      totalDiscount += (originalRate * discountPercent / 100) * qty;
    }
    return Number(totalDiscount.toFixed(2));
  }

  // ─── Mark Received (Wholesaler) ──────────────────────────────────────────────

  confirmReceived() {
    const invNo   = this.invoiceData?.invoiceNumber || '';
    const message = `Have you received the products of invoice no. ${invNo}?`;
    if (!window.confirm(message)) return;
    this.markInvoiceReceived();
  }

  markInvoiceReceived() {
    const url     = `pi-manufacture-to-wholesaler/${this.invoiceId}`;
    const payload = {
      statusAll:           'delivered',
      invoiceRecievedDate: new Date().toISOString(),
    };

    this.loading = true;
    (this.authService as any).patchpimage(url, payload).subscribe(
      (res: any) => {
        this.communicationService.customSuccess1('Invoice marked as received');
        this.responseData  = { ...this.responseData,  ...payload };
        this.invoiceData   = { ...this.invoiceData,   ...payload };
        this.loading       = false;
      },
      (error: any) => {
        console.error('Error updating invoice status:', error);
        this.communicationService.customError1('Failed to update invoice status');
        this.loading = false;
      }
    );
  }

  // ─── PDF Download ────────────────────────────────────────────────────────────

  async downloadInvoice() {
    const doc        = new jsPDF('p', 'mm', 'a4');
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin     = 10;
    const contentWidth = pageWidth - margin * 2;
    let y = 15;

    // ── Header ──
    const headerHeight = 25;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, headerHeight, 'F');
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, headerHeight);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(this.invoiceData.sellerName, margin + 5, y + 8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.invoiceData.sellerAddress, margin + 5, y + 13);
    doc.text(`Ph: ${this.invoiceData.sellerContact} | Email: ${this.invoiceData.sellerEmail}`, margin + 5, y + 18);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 130, 180);
    doc.text('TAX INVOICE', pageWidth - margin - 5, y + 8, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`GSTIN: ${this.invoiceData.sellerGSTIN}`, pageWidth - margin - 5, y + 15, { align: 'right' });

    doc.setFontSize(7);
    doc.text('ORIGINAL FOR RECIPIENT', pageWidth - margin - 5, y + 20, { align: 'right' });

    y += headerHeight + 10;

    // ── Customer & Invoice Info ──
    const boxHeight = 30;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, y, contentWidth * 0.65, boxHeight, 'F');
    doc.rect(margin, y, contentWidth * 0.65, boxHeight);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Detail', margin + 3, y + 6);

    doc.setFontSize(8);
    let custY = y + 10;
    [
      `Company: ${this.invoiceData.buyerName}`,
      `Address: ${this.invoiceData.buyerAddress}`,
      `Mobile: ${this.invoiceData.buyerContact}`,
      `GST: ${this.invoiceData.buyerGSTIN}`,
      `Place: ${this.responseData?.wholesaler?.state || ''} (${this.responseData?.wholesaler?.pinCode || ''})`,
    ].forEach(line => {
      doc.setFont('helvetica', 'normal');
      doc.text(line, margin + 3, custY);
      custY += 3.5;
    });

    const invBoxX = margin + contentWidth * 0.65 + 2;
    const invBoxW = contentWidth * 0.35 - 2;
    doc.rect(invBoxX, y, invBoxW, boxHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let invY = y + 6;
    [
      ['Invoice No:', this.invoiceData.invoiceNumber],
      ['Invoice Date:', this.invoiceData.invoiceDate],
      ['PO No:', this.invoiceData.poNumber?.toString()],
    ].forEach(([label, value]) => {
      doc.text(label, invBoxX + 2, invY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, pageWidth - margin - 3, invY, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      invY += 4.5;
    });

    y += boxHeight + 10;

    // ── Items Table ──
    const totals = this.itemTotals;
    let tableHeaders: string[];
    let tableData: any[][];

    if (this.isIntraState) {
      tableHeaders = ['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'Total'];
      tableData = this.invoiceData.deliveryItems.map((item: any, idx: number) => {
        const g = this.getGstAmounts(item);
        return [
          (idx + 1).toString(),
          `${item.designNumber}\nBrand: ${item.brandName}\n${item.gender} ${item.clothing} - ${item.colourName} - ${item.size}`,
          item.hsnCode || '',
          item.quantity.toString(),
          g.discountedRate.toFixed(2),
          g.taxable.toFixed(2),
          `${(item.hsnGst / 2 || 0).toFixed(1)}%`,
          g.cgst.toFixed(2),
          `${(item.hsnGst / 2 || 0).toFixed(1)}%`,
          g.sgst.toFixed(2),
          g.totalWithGst.toFixed(2),
        ];
      });
      tableData.push(['', 'Total', '', totals.totalQty.toString(), '',
        totals.totalTaxable.toFixed(2), '', totals.totalCGST.toFixed(2),
        '', totals.totalSGST.toFixed(2), totals.totalWithGST.toFixed(2)]);
    } else {
      tableHeaders = ['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'IGST %', 'IGST Amt', 'Total'];
      tableData = this.invoiceData.deliveryItems.map((item: any, idx: number) => {
        const g = this.getGstAmounts(item);
        return [
          (idx + 1).toString(),
          `${item.designNumber}\nBrand: ${item.brandName}\n${item.gender} ${item.clothing} - ${item.colourName} - ${item.size}`,
          item.hsnCode || '',
          item.quantity.toString(),
          g.discountedRate.toFixed(2),
          g.taxable.toFixed(2),
          `${(item.hsnGst || 0).toFixed(1)}%`,
          g.igst.toFixed(2),
          g.totalWithGst.toFixed(2),
        ];
      });
      tableData.push(['', 'Total', '', totals.totalQty.toString(), '',
        totals.totalTaxable.toFixed(2), '', totals.totalIGST.toFixed(2),
        totals.totalWithGST.toFixed(2)]);
    }

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1, lineColor: [180, 180, 180], lineWidth: 0.2, textColor: [0, 0, 0], overflow: 'linebreak', halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, halign: 'center', cellPadding: 1 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { halign: 'center', minCellWidth: 8 },
        1: { halign: 'left',   minCellWidth: 35 },
        2: { halign: 'center', minCellWidth: 12 },
        3: { halign: 'center', minCellWidth: 10 },
        4: { halign: 'right',  minCellWidth: 12 },
        5: { halign: 'right',  minCellWidth: 16 },
        6: { halign: 'center', minCellWidth: 10 },
        7: { halign: 'right',  minCellWidth: 14 },
        8: { halign: this.isIntraState ? 'center' : 'right', minCellWidth: this.isIntraState ? 10 : 18 },
        ...(this.isIntraState && {
          9:  { halign: 'right', minCellWidth: 14 },
          10: { halign: 'right', minCellWidth: 18 },
        }),
      },
      tableWidth: 'auto',
      margin: { left: margin + 2, right: margin + 2 },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize  = 7;
        }
      },
      showHead: 'everyPage',
      pageBreak: 'auto',
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180],
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    if (pageHeight - y - margin < 60) { doc.addPage(); y = 20; }

    // ── Financial Summary ──
    const summaryBoxH = 35;
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth * 0.6, summaryBoxH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Total in words', margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const words = this.amountInWordsPipe.transform(this.totalPayAmount);
    doc.text(doc.splitTextToSize(words, contentWidth * 0.55), margin + 3, y + 12);

    if (this.discountPercentage > 0) {
      doc.setFontSize(7);
      doc.setTextColor(34, 139, 34);
      doc.setFont('helvetica', 'bold');
      doc.text(`Note: ${this.discountPercentage}% discount applied (Approx. Total Discount: Rs.${this.calculateActualDiscount().toFixed(2)})`, margin + 3, y + 25);
      doc.setTextColor(0, 0, 0);
    }

    const rightBoxX = margin + contentWidth * 0.6 + 2;
    const rightBoxW = contentWidth * 0.4 - 2;
    doc.rect(rightBoxX, y, rightBoxW, summaryBoxH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let sumY = y + 6;

    const summaryItems: string[][] = [
      ['Taxable Amount',            totals.totalTaxable.toFixed(2)],
      [`Add: ${this.isIntraState ? 'CGST + SGST' : 'IGST'}`, this.totalGSTAmount.toFixed(2)],
      ['Total (Incl. Tax)',          this.totalAmountInclTax.toFixed(2)],
    ];

    if ((this.responseData?.totalCreditNoteAmountUsed || 0) > 0) {
      summaryItems.push(['Less: Credit Note', (this.responseData?.totalCreditNoteAmountUsed || 0).toFixed(2)]);
    }

    summaryItems.forEach(([label, amount]) => {
      doc.text(label, rightBoxX + 2, sumY);
      doc.text(amount, pageWidth - margin - 3, sumY, { align: 'right' });
      sumY += 3;
    });

    sumY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 32, 128);
    doc.text('Total Pay Amount', rightBoxX + 2, sumY);
    doc.text(`Rs.${this.totalPayAmount.toFixed(2)}`, pageWidth - margin - 3, sumY, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    y += summaryBoxH + 15;

    if (pageHeight - y - margin < 40) { doc.addPage(); y = 20; }

    // ── Bank Details ──
    if (this.invoiceData.bankDetails) {
      const bankH = 25;
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth * 0.6, bankH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Bank Details', margin + 2, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      let bY = y + 9;
      [
        `Account Holder: ${this.invoiceData.bankDetails.accountHolderName}`,
        `Bank: ${this.invoiceData.bankDetails.bankName}`,
        `Branch: ${this.invoiceData.bankDetails.branchName}`,
        `A/c: ${this.invoiceData.bankDetails.accountNumber}`,
        `IFSC: ${this.invoiceData.bankDetails.ifscCode}`,
      ].forEach(line => { doc.text(line, margin + 2, bY); bY += 3; });

      y += bankH + 8;
    }

    // ── Transport Details ──
    if (this.invoiceData.transportDetails) {
      if (pageHeight - y - margin < 20) { doc.addPage(); y = 20; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Transport Details', margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      y += 4;

      const td = this.invoiceData.transportDetails;
      doc.text(`Transport: ${td.modeOfTransport} via ${td.transporterCompanyName}`, margin, y);
      if (td.vehicleNumber)      { y += 3; doc.text(`Vehicle: ${td.vehicleNumber}`, margin, y); }
      if (td.trackingId)         { y += 3; doc.text(`Tracking ID: ${td.trackingId}`, margin, y); }
      if (td.contactPersonName)  { y += 3; doc.text(`Contact: ${td.contactPersonName} (${td.contactNumber})`, margin, y); }

      y += 6;
    }

    // ── Terms ──
    if (pageHeight - y - margin < 15) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Terms and Conditions', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    y += 4;
    ['Our Responsibility Ceases as soon as goods leaves our Premises.',
     'Goods once sold will not taken back.',
     'Delivery Ex-Premises.']
      .forEach(t => { doc.text(t, margin, y); y += 3; });

    // ── Disclaimer ──
    if (pageHeight - y - margin < 10) { doc.addPage(); y = 20; }

    y += 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer-generated invoice and does not require signature.', pageWidth / 2, y, { align: 'center' });

    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`Invoice_M2W_${this.invoiceData.invoiceNumber}_${timestamp}.pdf`);
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  navigateBack() {
    this.location.back();
  }

  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) return '';
    try { return gstin.substring(2, 12).toUpperCase(); }
    catch { return ''; }
  }
}
