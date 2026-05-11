import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-cp-shopk-mfg-view-po',
  standalone: true,
  imports: [CommonModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './cp-shopk-mfg-view-po.component.html',
  styleUrl: './cp-shopk-mfg-view-po.component.scss'
})
export class CpShopkMfgViewPoComponent implements OnInit {

  poId = '';
  po: any = null;
  loading = false;
  downloading = false;

  // ── GST ──────────────────────────────────────
  isIntraState = false;
  sgst = 0; cgst = 0; igst = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService,
    private amountInWordsPipe: AmountInWordsPipe
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.poId = params['poId'] || '';
      if (this.poId) this.getPO();
    });
  }

  getPO(): void {
    this.loading = true;
    this.authService.get(`po-cp-to-manufacture/${this.poId}`).subscribe({
      next: (res: any) => {
        this.po = res?.data || res;
        this.detectGstType();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.communicationService.customError1('Unable to load Purchase Order');
      }
    });
  }

  detectGstType(): void {
    const shopState = this.po?.shopkeeper?.state?.trim().toLowerCase();
    const mfgState  = this.po?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = !!(shopState && mfgState && shopState === mfgState);
  }

  // ── Per-item GST ──────────────────────────────
  getGstAmounts(item: any) {
    const qty     = Number(item.quantity) || 0;
    const rate    = Number(item.price) || 0;
    const gstRate = Number(item.hsnGst) || 0;
    const disc    = Number(this.po?.discount) || 0;
    const discRate = rate - (rate * disc / 100);
    const taxable  = qty * discRate;

    let cgst = 0, sgst = 0, igst = 0;
    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }
    const totalWithGst = taxable + cgst + sgst + igst;
    return {
      originalRate: rate, discountedRate: discRate,
      taxable:      isNaN(taxable)      ? 0 : taxable,
      cgst:         isNaN(cgst)         ? 0 : cgst,
      sgst:         isNaN(sgst)         ? 0 : sgst,
      igst:         isNaN(igst)         ? 0 : igst,
      gstRate,
      totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst
    };
  }

  get orderTotals() {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0,
        totalSGST = 0, totalIGST = 0, totalWithGST = 0;
    for (const item of (this.po?.items || [])) {
      const g = this.getGstAmounts(item);
      totalQty     += Number(item.quantity) || 0;
      totalTaxable += g.taxable;
      totalCGST    += g.cgst;
      totalSGST    += g.sgst;
      totalIGST    += g.igst;
      totalWithGST += g.totalWithGst;
    }
    return { totalQty, totalTaxable, totalCGST, totalSGST, totalIGST, totalWithGST };
  }

  get totalGSTAmount(): number {
    const t = this.orderTotals;
    return t.totalCGST + t.totalSGST + t.totalIGST;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST;
  }

  get discountAmount(): number {
    let total = 0;
    for (const item of (this.po?.items || [])) {
      total += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    }
    return (total * (Number(this.po?.discount) || 0)) / 100;
  }

  get colspan(): number { return this.isIntraState ? 15 : 14; }

  getStatusClass(status: string): string {
    const map: any = {
      pending: 'badge-pending', accepted: 'badge-accepted',
      processing: 'badge-processing', shipped: 'badge-shipped',
      delivered: 'badge-delivered', rejected: 'badge-rejected',
      cancelled: 'badge-cancelled'
    };
    return map[status] || 'badge-default';
  }

  // ── Download PDF ──────────────────────────────
 downloadPDF(): void {
  if (!this.po) return;
  this.downloading = true;

  const pdf = new jsPDF('l', 'mm', 'a4'); // ← landscape
  const pageWidth  = pdf.internal.pageSize.getWidth();  // 297mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
  let y = 14;

  const blue  = [0, 32, 128]   as [number,number,number];
  const green = [5, 150, 105]  as [number,number,number];
  const gray  = [107,114,128]  as [number,number,number];
  const light = [242,246,250]  as [number,number,number];
  const RS    = 'Rs. ';  // ← use Rs. instead of ₹ to avoid encoding issues

  // ══ HEADER ════════════════════════════════
  pdf.setFillColor(...blue);
  pdf.rect(0, 0, pageWidth, 20, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(15);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PURCHASE ORDER', 14, 13);
  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`PO # ${this.po.poNumber}`, pageWidth - 14, 8,  { align: 'right' });
  pdf.text(`Date: ${new Date(this.po.poDate).toLocaleDateString('en-IN')}`, pageWidth - 14, 14, { align: 'right' });
  pdf.text(`Status: ${(this.po.statusAll || '').toUpperCase()}`, pageWidth - 14, 20, { align: 'right' });
  y = 28;

  // ══ 3 PARTY BOXES ═════════════════════════
  const boxW = (pageWidth - 30) / 3;
  const boxH = 36;

  const parties = [
    {
      label: 'CHANNEL PARTNER (Order By)',
      color: [219,234,254] as [number,number,number],
      tc: blue,
      lines: [
        this.po.cp?.companyName || this.po.cp?.fullName || '',
        this.po.cpEmail || '',
        this.po.cp?.mobNumber ? `Ph: ${this.po.cp.mobNumber}` : '',
        this.po.cp?.GSTIN ? `GSTIN: ${this.po.cp.GSTIN}` : '',
      ]
    },
    {
      label: 'SHOPKEEPER (Deliver To)',
      color: [209,250,229] as [number,number,number],
      tc: green,
      lines: [
        this.po.shopkeeper?.shopName || this.po.shopkeeper?.fullName || '',
        this.po.shopKeeperEmail || '',
        [this.po.shopkeeper?.address, this.po.shopkeeper?.city, this.po.shopkeeper?.state].filter(Boolean).join(', '),
        this.po.shopkeeper?.mobNumber ? `Ph: ${this.po.shopkeeper.mobNumber}` : '',
        this.po.shopkeeper?.GSTIN ? `GSTIN: ${this.po.shopkeeper.GSTIN}` : '',
      ]
    },
    {
      label: 'MANUFACTURER (Order To)',
      color: [254,226,226] as [number,number,number],
      tc: [153,27,27] as [number,number,number],
      lines: [
        this.po.manufacturer?.companyName || this.po.manufacturer?.fullName || '',
        this.po.manufacturerEmail || '',
        [this.po.manufacturer?.address, this.po.manufacturer?.city, this.po.manufacturer?.state].filter(Boolean).join(', '),
        this.po.manufacturer?.mobNumber ? `Ph: ${this.po.manufacturer.mobNumber}` : '',
        this.po.manufacturer?.GSTIN ? `GSTIN: ${this.po.manufacturer.GSTIN}` : '',
      ]
    }
  ];

  parties.forEach((p, i) => {
    const x = 14 + i * (boxW + 4);
    pdf.setFillColor(...p.color);
    pdf.roundedRect(x, y, boxW, boxH, 2, 2, 'F');
    pdf.setTextColor(...p.tc);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text(p.label, x + 3, y + 5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(20, 20, 20);
    pdf.text(p.lines[0], x + 3, y + 11, { maxWidth: boxW - 6 });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    let ly = y + 17;
    p.lines.slice(1).filter(l => l).forEach(line => {
      pdf.text(line, x + 3, ly, { maxWidth: boxW - 6 });
      ly += 5;
    });
  });
  y += boxH + 5;

  // ══ TRANSPORT ═════════════════════════════
  const td = this.po.transportDetails;
  if (td && (td.transporterCompanyName || td.trackingId)) {
    pdf.setFillColor(...light);
    pdf.rect(14, y, pageWidth - 28, 18, 'F');
    pdf.setTextColor(...blue);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSPORT', 17, y + 5);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    const tParts = [
      td.transportType       ? `Type: ${td.transportType}` : '',
      td.modeOfTransport     ? `Mode: ${td.modeOfTransport}` : '',
      td.transporterCompanyName ? `Co: ${td.transporterCompanyName}` : '',
      td.contactNumber       ? `Contact: ${td.contactNumber}` : '',
      td.vehicleNumber       ? `Vehicle: ${td.vehicleNumber}` : '',
      td.trackingId          ? `Tracking: ${td.trackingId}` : '',
    ].filter(Boolean).join('   |   ');
    pdf.text(tParts, 17, y + 11, { maxWidth: pageWidth - 34 });
    if (td.deliveryAddress) {
      pdf.text(`Delivery: ${td.deliveryAddress}`, 17, y + 16, { maxWidth: pageWidth - 34 });
    }
    y += 24;
  }

  // ══ ITEMS TABLE ═══════════════════════════
  const isIntra = this.isIntraState;
  const disc    = Number(this.po.discount) || 0;

  const headCols = [
    'Sr', 'Design No', 'Brand', 'Colour', 'HSN', 'GST %',  'Size', 'Qty',
    `Rate (${RS})`,
    `Taxable (${RS})`,
    isIntra ? `CGST (${RS})` : `IGST (${RS})`,
    isIntra ? `SGST (${RS})` : '',
    `Total (${RS})`
  ].filter(Boolean);

  const bodyRows = this.po.items.map((item: any, idx: number) => {
    const g = this.getGstAmounts(item);
    const rate = disc > 0
      ? `${item.price}\n(-${disc}%) = ${g.discountedRate.toFixed(0)}`
      : `${item.price}`;

    const row = [
      idx + 1,
      item.designNumber,
      item.brandName || '',
      item.colourName,
      item.hsnCode || '',
      `${item.hsnGst || 0}%`,
      item.size,
      item.quantity,
      rate,
      g.taxable.toFixed(0),
      isIntra ? g.cgst.toFixed(0) : g.igst.toFixed(0),
      isIntra ? g.sgst.toFixed(0) : null,
      g.totalWithGst.toFixed(0),
    ].filter(v => v !== null);

    return row;
  });

  const t = this.orderTotals;
  const totalCols = isIntra ? 13 : 12; 
  const grandTotalStr = `${RS}${t.totalWithGST.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const footRows: any[] = [
    [
      { content: 'TOTAL', colSpan: 7, styles: { halign: 'right', fontStyle: 'bold' } },  
      { content: t.totalQty, styles: { halign: 'center', fontStyle: 'bold' } },
      { content: '', styles: {} },
      { content: t.totalTaxable.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } },
      { content: isIntra ? t.totalCGST.toFixed(0) : t.totalIGST.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } },
      ...(isIntra ? [{ content: t.totalSGST.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } }] : []),
      { content: t.totalWithGST.toFixed(0), styles: { halign: 'right', fontStyle: 'bold' } },
    ],
    [{ content: `Grand Total: ${grandTotalStr}`, colSpan: totalCols, styles: { halign: 'right', fontStyle: 'bold', textColor: blue, fontSize: 10 } }],
    [{ content: `In Words: ${this.amountInWordsPipe.transform(this.actualGrandTotal)}`, colSpan: totalCols, styles: { halign: 'left', fontStyle: 'bold', textColor: blue } }],
    [{ content: `Total GST: ${RS}${this.totalGSTAmount.toFixed(0)} — ${this.amountInWordsPipe.transform(this.totalGSTAmount)}`, colSpan: totalCols, styles: { halign: 'left', textColor: [5,150,105] as [number,number,number] } }],
    ...(disc > 0 ? [[{ content: `${disc}% discount applied. Discount: ${RS}${this.discountAmount.toFixed(0)}`, colSpan: totalCols, styles: { halign: 'center', textColor: [146,64,14] as [number,number,number], fillColor: [254,243,199] as [number,number,number] } }]] : []),
  ];

  autoTable(pdf, {
    head: [headCols],
    body: bodyRows,
    foot: footRows,
    startY: y,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: blue,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [248,250,252] as [number,number,number] },
    footStyles: { fillColor: light, textColor: [30,30,30] as [number,number,number], fontSize: 8 },
    columnStyles: {
      0:  { halign: 'center', cellWidth: 10 },
      1:  { cellWidth: 22 },
      2:  { cellWidth: 18 },
      3:  { cellWidth: 22 },
      4:  { cellWidth: 22 },
      5:  { halign: 'center', cellWidth: 14 },  // ← GST %
      6:  { halign: 'center', cellWidth: 16 },  // size
      7:  { halign: 'center', cellWidth: 12 },  // qty
      8:  { halign: 'right',  cellWidth: 22 },  // rate
      9:  { halign: 'right',  cellWidth: 22 },  // taxable
      10: { halign: 'right',  cellWidth: 20 },  // cgst/igst
      11: { halign: 'right',  cellWidth: isIntra ? 20 : 24 },
      12: { halign: 'right',  cellWidth: 24 },
    },
    margin: { left: 14, right: 14, bottom: 14 },
    didDrawPage: (data: any) => {
      pdf.setFontSize(8);
      pdf.setTextColor(...gray);
      pdf.text(
        `Page ${data.pageNumber}  |  PO #${this.po.poNumber}  |  ${new Date(this.po.poDate).toLocaleDateString('en-IN')}`,
        pageWidth / 2, pageHeight - 6, { align: 'center' }
      );
    }
  });

  pdf.save(`PO_${this.po.poNumber || this.poId}.pdf`);
  this.downloading = false;
}
  navigateFun(): void { this.location.back(); }
}
