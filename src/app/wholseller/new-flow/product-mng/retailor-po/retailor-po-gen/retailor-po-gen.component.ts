import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';

// ─── Interfaces ───────────────────────────────────────────────────────────────

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

interface WholesalerProfile {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-retailor-po-gen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    TableModule,
    RouterModule,
    IndianCurrencyPipe,
    AmountInWordsPipe,
  ],
  templateUrl: './retailor-po-gen.component.html',
  styleUrl: './retailor-po-gen.component.scss',
})
export class RetailorPoGenComponent implements OnInit {

  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: '',
    orderNumber: '',
    poDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    ProductDiscount: 0,
    transportDetails: null,
  };

  responseData: any;
  distributorId: string;
  userProfile: any;

  // Wholesaler-specific
  bankDetails!: BankDetails;
  wholesalerProfile!: WholesalerProfile;

  isIntraState: boolean = false;
  expDeliveryDate: Date | string = '';
  wholesalerNote: string = '';

  // ── MTO flags (only for "View Source Order" button in HTML) ──────────────
  statusAll: string = '';
  previousPoId: string = '';

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe
  ) {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.distributorId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ══════════════════════════════════════════════════════════════════════════

  getAllProducts(distributorId: string): void {
    const url = `po-retailer-to-wholesaler/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;

        const filteredProductSet = (res.set || []).filter(
          (item: any) => item.quantity && parseInt(item.quantity) > 0
        );

        this.purchaseOrder = {
          supplierName: res.wholesaler.companyName,
          supplierDetails: res.wholesaler.fullName,
          supplierAddress: `${res.wholesaler.address}, ${res.wholesaler.pinCode} - ${res.wholesaler.state}`,
          supplierContact: res.wholesaler.mobNumber,
          supplierGSTIN: res.wholesaler.GSTIN || '',
          supplierEmail: res.wholesaler.email,
          supplierPAN:
            this.extractPanFromGstin(res.wholesaler.GSTIN) ||
            res.wholesaler.PAN || '',

          buyerName: res.retailer.companyName,
          buyerAddress: `${res.retailer.address}, ${res.retailer.pinCode} - ${res.retailer.state}`,
          buyerPhone: res.retailer.mobNumber,
          buyerEmail: res.retailer.email,
          buyerGSTIN: res.retailer.GSTIN,
          buyerPAN:
            this.extractPanFromGstin(res.retailer.GSTIN) ||
            res.retailer.PAN || '',

          logoUrl: res.retailer.logo || '',
          poDate: new Date(res.retailerPoDate).toLocaleDateString(),
          orderNumber: res.poNumber,
          products: filteredProductSet,
          ProductDiscount: parseFloat(
            res.discount || res.retailer.productDiscount || 0
          ),
          transportDetails: res.transportDetails,
        };

        this.expDeliveryDate =
          res.expDeliveryDate || res.expectedDeliveryDate || res.deliveryDate || '';
        this.wholesalerNote =
          res.wholesalerNote || res.note || res.wholesaler?.notes || '';

        this.wholesalerProfile = res.wholesaler;

        // MTO (needed only for "View Source Order" button)
        this.statusAll = res.statusAll || '';
        this.previousPoId = res.previousPoId || '';

        // Bank details
        if (res.bankDetails || res.wholesaler?.bankDetails) {
          const bankData = res.bankDetails || res.wholesaler.bankDetails;
          this.bankDetails = {
            accountHolderName: bankData.accountHolderName,
            accountNumber: bankData.accountNumber,
            accountType: bankData.accountType,
            bankName: bankData.bankName,
            branchName: bankData.branchName,
            ifscCode: bankData.ifscCode,
            swiftCode: bankData.swiftCode,
            upiId: bankData.upiId,
            bankAddress: bankData.bankAddress,
          };
        }

        this.updateStateType();
      },
      (err) => {
        console.error('Error fetching PO:', err);
      }
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GST / STATE HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  updateStateType(): void {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.wholesaler?.state?.trim().toLowerCase();
    this.isIntraState =
      !!buyerState && !!supplierState && buyerState === supplierState;
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  getGstAmounts(item: any) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    const gstRate = Number(item.hsnGst) || 0;

    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountedRate = rate - (rate * discountPercent) / 100;
    const taxable = quantity * discountedRate;

    let cgst = 0, sgst = 0, igst = 0;
    if (this.isIntraState) {
      cgst = (taxable * gstRate) / 2 / 100;
      sgst = (taxable * gstRate) / 2 / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }

    const totalWithGst = taxable + cgst + sgst + igst;

    return {
      originalRate: isNaN(rate) ? 0 : rate,
      discountedRate: isNaN(discountedRate) ? 0 : discountedRate,
      taxable: isNaN(taxable) ? 0 : taxable,
      gstRate: isNaN(gstRate) ? 0 : gstRate,
      cgst: isNaN(cgst) ? 0 : cgst,
      sgst: isNaN(sgst) ? 0 : sgst,
      igst: isNaN(igst) ? 0 : igst,
      totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPUTED GETTERS
  // ══════════════════════════════════════════════════════════════════════════

  get orderTotals() {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0;
    let totalSGST = 0, totalIGST = 0, totalWithGST = 0;

    for (const item of this.purchaseOrder.products) {
      const gst = this.getGstAmounts(item);
      totalQty      += Number(item.quantity) || 0;
      totalTaxable  += gst.taxable;
      totalCGST     += gst.cgst;
      totalSGST     += gst.sgst;
      totalIGST     += gst.igst;
      totalWithGST  += gst.totalWithGst;
    }

    return {
      totalQty:      isNaN(totalQty)      ? 0 : totalQty,
      totalTaxable:  isNaN(totalTaxable)  ? 0 : totalTaxable,
      totalCGST:     isNaN(totalCGST)     ? 0 : totalCGST,
      totalSGST:     isNaN(totalSGST)     ? 0 : totalSGST,
      totalIGST:     isNaN(totalIGST)     ? 0 : totalIGST,
      totalWithGST:  isNaN(totalWithGST)  ? 0 : totalWithGST,
    };
  }

  get discountAmount(): number {
    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const totalWithoutDiscount = this.purchaseOrder.products.reduce(
      (sum: number, item: any) =>
        sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0
    );
    const discount = (totalWithoutDiscount * discountPercent) / 100;
    return isNaN(discount) ? 0 : discount;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST;
  }

  get totalGSTAmount(): number {
    const { totalCGST, totalSGST, totalIGST } = this.orderTotals;
    const total = totalCGST + totalSGST + totalIGST;
    return isNaN(total) ? 0 : total;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PDF DOWNLOAD
  // ══════════════════════════════════════════════════════════════════════════

  downloadPO(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Order meta
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Date: ${this.purchaseOrder.poDate}`, pageWidth - 20, y, { align: 'right' });
    doc.text(`Order No: ${this.purchaseOrder.orderNumber}`, pageWidth - 20, y + 5, { align: 'right' });
    y += 20;

    // Buyer / Seller
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order By:', 20, y);
    doc.text('Order To:', 110, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const buyerInfo = [
      this.purchaseOrder.buyerName || '',
      this.purchaseOrder.buyerAddress || '',
      `Phone: ${this.purchaseOrder.buyerPhone || 'N/A'}`,
      `Email: ${this.purchaseOrder.buyerEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.buyerGSTIN || 'N/A'}`,
      `PAN: ${this.purchaseOrder.buyerPAN || 'N/A'}`,
    ];

    const supplierInfo = [
      this.purchaseOrder.supplierName || '',
      this.purchaseOrder.supplierAddress || '',
      `Phone: ${this.purchaseOrder.supplierContact || 'N/A'}`,
      `Email: ${this.purchaseOrder.supplierEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.supplierGSTIN || 'N/A'}`,
      `PAN: ${this.purchaseOrder.supplierPAN || 'N/A'}`,
    ];

    for (let i = 0; i < Math.max(buyerInfo.length, supplierInfo.length); i++) {
      if (buyerInfo[i])    doc.text(buyerInfo[i], 20, y);
      if (supplierInfo[i]) doc.text(supplierInfo[i], 110, y);
      y += 5;
    }

    y += 10;

    // Section heading
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Table headers
    const tableHeaders = this.isIntraState
      ? ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size',
         'Rate (Rs.)', 'Qty', 'Taxable (Rs.)', 'GST%',
         'CGST (Rs.)', 'SGST (Rs.)', 'Total (Rs.)']
      : ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size',
         'Rate (Rs.)', 'Qty', 'Taxable (Rs.)', 'GST%',
         'IGST (Rs.)', 'Total (Rs.)'];

    // Table rows
    const tableData = this.purchaseOrder.products.map(
      (item: any, index: number) => {
        const g = this.getGstAmounts(item);
        const base = [
          (index + 1).toString(),
          item.designNumber || '',
          item.hsnCode || '',
          item.colourName || '',
          item.gender || '',
          item.size || '',
          g.discountedRate.toFixed(2),
          item.quantity?.toString() || '0',
          g.taxable.toFixed(2),
          `${item.hsnGst || 0}%`,
        ];
        return this.isIntraState
          ? [...base, g.cgst.toFixed(2), g.sgst.toFixed(2), g.totalWithGst.toFixed(2)]
          : [...base, g.igst.toFixed(2), g.totalWithGst.toFixed(2)];
      }
    );

    // Totals row
    const t = this.orderTotals;
    const totalRow = this.isIntraState
      ? ['', '', '', '', '', '', 'Total:', t.totalQty.toString(),
         t.totalTaxable.toFixed(2), '',
         t.totalCGST.toFixed(2), t.totalSGST.toFixed(2), t.totalWithGST.toFixed(2)]
      : ['', '', '', '', '', '', 'Total:', t.totalQty.toString(),
         t.totalTaxable.toFixed(2), '',
         t.totalIGST.toFixed(2), t.totalWithGST.toFixed(2)];

    tableData.push(totalRow);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [240, 246, 249],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [220, 235, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 8;
        }
      },
      margin: { top: 10, right: 10, bottom: 30, left: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // ── Financial summary ──────────────────────────────────────────────────
    if (y > pageHeight - 60) { doc.addPage(); y = 30; }
    this.addFinancialSummary(doc, y, pageWidth);
    y += 40;

    // ── Transport details ──────────────────────────────────────────────────
    if (this.purchaseOrder.transportDetails) {
      if (y > pageHeight - 80) { doc.addPage(); y = 30; }
      y = this.addTransportDetails(doc, y, pageWidth);
      y += 20;
    }

    // ── Bank details ───────────────────────────────────────────────────────
    if (this.bankDetails) {
      if (y > pageHeight - 80) { doc.addPage(); y = 30; }
      this.addBankDetails(doc, y, pageWidth);
    }

    const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
    doc.save(`PO_${poDate}_${this.purchaseOrder.orderNumber}.pdf`);
  }

  private addFinancialSummary(doc: jsPDF, startY: number, pageWidth: number): void {
    const rightAlign = pageWidth - 20;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (this.purchaseOrder.ProductDiscount > 0) {
      doc.text(
        `Note: ${this.purchaseOrder.ProductDiscount}% discount applied on product rates`,
        20, startY
      );
      doc.text(
        `(Total Discount: Rs. ${this.discountAmount.toFixed(2)})`,
        20, startY + 5
      );
      startY += 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
      `Grand Total: Rs. ${this.actualGrandTotal.toFixed(2)}`,
      rightAlign, startY, { align: 'right' }
    );

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Amount in Words: ${this.amountInWordsPipe.transform(this.actualGrandTotal)}`,
      20, startY + 10
    );
    doc.text(
      `Total GST: Rs. ${this.totalGSTAmount.toFixed(2)} - ${this.amountInWordsPipe.transform(this.totalGSTAmount)}`,
      20, startY + 15
    );
  }

  private addTransportDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Details', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const tr = this.purchaseOrder.transportDetails;
    const left  = [
      `Transport Type: ${tr.transportType || 'N/A'}`,
      `Company: ${tr.transporterCompanyName || 'N/A'}`,
      `Contact Person: ${tr.contactPersonName || 'N/A'}`,
      `Contact: ${tr.contactNumber || 'N/A'}`,
      `Alt Contact: ${tr.altContactNumber || 'N/A'}`,
    ];
    const right = [
      `Vehicle Number: ${tr.vehicleNumber || 'N/A'}`,
      `Tracking ID: ${tr.trackingId || 'N/A'}`,
      `Mode: ${tr.modeOfTransport || 'N/A'}`,
      `Delivery Address: ${tr.deliveryAddress || 'N/A'}`,
      '',
    ];

    for (let i = 0; i < left.length; i++) {
      doc.text(left[i], 20, startY);
      if (right[i]) doc.text(right[i], 110, startY);
      startY += 5;
    }

    if (tr.remarks) { doc.text(`Remarks: ${tr.remarks}`, 20, startY); startY += 5; }
    if (tr.note)    { doc.text(`Note: ${tr.note}`, 20, startY);       startY += 5; }

    return startY;
  }

  private addBankDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details (Wholesaler)', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const left = [
      `Account Holder: ${this.bankDetails.accountHolderName || 'N/A'}`,
      `Account Number: ${this.bankDetails.accountNumber || 'N/A'}`,
      `Account Type: ${this.bankDetails.accountType || 'N/A'}`,
      `Bank Name: ${this.bankDetails.bankName || 'N/A'}`,
      `UPI ID: ${this.bankDetails.upiId || 'N/A'}`,
    ];
    const right = [
      `Branch: ${this.bankDetails.branchName || 'N/A'}`,
      `IFSC Code: ${this.bankDetails.ifscCode || 'N/A'}`,
      `Swift Code: ${this.bankDetails.swiftCode || 'N/A'}`,
      `Location: ${this.bankDetails.bankAddress || 'N/A'}`,
      '',
    ];

    for (let i = 0; i < left.length; i++) {
      doc.text(left[i], 20, startY);
      if (right[i]) doc.text(right[i], 110, startY);
      startY += 5;
    }

    return startY;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════════════════════════════════════

  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) return '';
    try {
      return gstin.substring(2, 12).toUpperCase();
    } catch {
      return '';
    }
  }

  navigateFun(): void {
    this.location.back();
  }
}
