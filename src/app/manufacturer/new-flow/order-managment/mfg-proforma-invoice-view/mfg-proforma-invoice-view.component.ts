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
  selector: 'app-mfg-proforma-invoice-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, RouterModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './mfg-proforma-invoice-view.component.html',
  styleUrl: './mfg-proforma-invoice-view.component.scss'
})
export class MfgProformaInvoiceViewComponent implements OnInit {
  
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
  }

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || '';
    this.isRetailer = this.currentUserRole === 'retailer';

    this.getInvoiceDetails();
  }

  getInvoiceDetails() {
    this.loading = true;
    const url = `pi-manufacture-to-retailer/${this.invoiceId}`;
    
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
      
      // Manufacturer (Seller) details
      sellerName: data.manufacturer.companyName,
      sellerFullName: data.manufacturer.fullName,
      sellerAddress: `${data.manufacturer.address}, ${data.manufacturer.pinCode} - ${data.manufacturer.state}`,
      sellerContact: data.manufacturer.mobNumber,
      sellerEmail: data.manufacturer.email,
      sellerGSTIN: data.manufacturer.GSTIN,
      sellerPAN: this.extractPanFromGstin(data.manufacturer.GSTIN),
      
      // Retailer (Buyer) details
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

    // Check if intra-state
    this.updateStateType();
  }

  updateStateType() {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const sellerState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = buyerState && sellerState && (buyerState === sellerState);
  }

  // Calculate individual item price properly
getItemPrice(item: any): number {
  // ✅ NEW: Use item.price directly from API response
  if (item.price) {
    return parseFloat(item.price.toString());
  }
  // Fallback: Calculate from total if price not available
  // const totalItems = this.invoiceData.deliveryItems.reduce((sum: number, i: any) => sum + i.quantity, 0);
  // if (totalItems > 0) {
  //   return this.invoiceData.totalAmount / totalItems;
  // }
  return 0;
}


// GST calculations for individual items
 getGstAmounts(item: any) {
  const quantity = item.quantity || 0;
  const rate = this.getItemPrice(item);
  const gstRate = Number(item.hsnGst) || 0;
  
  // ✅ Apply discount to rate BEFORE calculating taxable value
  // Get discount from invoice data (already applied during invoice creation)
  const discountPercent = Number(this.responseData?.retailer?.productDiscount) || 0;
  const discountedRate = rate - (rate * discountPercent / 100);
  
  const taxable = quantity * discountedRate; // Use discounted rate
  
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

  // Overall totals calculation
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

  // Total GST amount
  get totalGSTAmount(): number {
    const totals = this.itemTotals;
    return Number((totals.totalCGST + totals.totalSGST + totals.totalIGST).toFixed(2));
  }

  // Final amount after all deductions
  get finalAmountAfterDeductions(): number {
    const totals = this.itemTotals;
    const discount = Number(this.invoiceData.discountApplied) || 0;
    const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
    
    return Number((totals.totalWithGST - discount - creditNote).toFixed(2));
  }

  // Add this new getter after the finalAmountAfterDeductions getter
get totalAmountInclTax(): number {
  const totals = this.itemTotals;
  return Number((totals.totalTaxable + totals.totalCGST + totals.totalSGST + totals.totalIGST).toFixed(2));
}

get totalPayAmount(): number {
  // const discount = Number(this.invoiceData.discountApplied) || 0;  - discount 
  const creditNote = Number(this.responseData?.totalCreditNoteAmountUsed) || 0;
  
  return Number((this.totalAmountInclTax - creditNote).toFixed(2));
}

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  // Add this method after discountPercentage getter
calculateActualDiscount(): number {
  let totalDiscount = 0;
  
  for (const item of this.invoiceData.deliveryItems || []) {
    const quantity = item.quantity || 0;
    const originalRate = this.getItemPrice(item);
    const discountPercent = this.discountPercentage;
    
    // Calculate discount per item: original rate × discount % × quantity
    const itemDiscount = (originalRate * discountPercent / 100) * quantity;
    totalDiscount += itemDiscount;
  }
  
  return Number(totalDiscount.toFixed(2));
}

  // ===================== PDF GENERATION (NO LOGO + NO QR) =====================

  async downloadInvoice() {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);

  // Header Section - Clean and Simple (No Logo)
  const headerHeight = 25;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition, contentWidth, headerHeight, 'F');
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.rect(margin, yPosition, contentWidth, headerHeight);

  // Company Information
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(this.invoiceData.sellerName, margin + 5, yPosition + 8);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(this.invoiceData.sellerAddress, margin + 5, yPosition + 13);
  doc.text(`Ph: ${this.invoiceData.sellerContact} | Email: ${this.invoiceData.sellerEmail}`, margin + 5, yPosition + 18);

  // Invoice Title - Right Side
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

  // Invoice Details Box
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

  // Items Table - Responsive
  const totals = this.itemTotals;
  let tableHeaders: string[];
  let tableData: any[][];

if (this.isIntraState) {
  tableHeaders = ['Sr.', 'Product Details', 'HSN', 'Qty', 'Rate', 'Taxable Value', 'CGST %', 'CGST Amt', 'SGST %', 'SGST Amt', 'Total'];
  
  tableData = this.invoiceData.deliveryItems.map((item: any, index: number) => {
    const gstAmounts = this.getGstAmounts(item);
    const rate = gstAmounts.discountedRate; // ✅ Use discounted rate in PDF
    
    return [
      (index + 1).toString(),
      `${item.designNumber}\nBrand: ${item.brandName}\n${item.gender} ${item.clothing} - ${item.colourName} - ${item.size}`,
      item.hsnCode || '',
      item.quantity.toString(),
      rate.toFixed(2),
      gstAmounts.taxable.toFixed(2),
      `${(item.hsnGst/2 || 0).toFixed(1)}%`,
      gstAmounts.cgst.toFixed(2),
      `${(item.hsnGst/2 || 0).toFixed(1)}%`,
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
    const rate = gstAmounts.discountedRate; // ✅ Use discounted rate in PDF
    
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

  // Generate responsive table
  autoTable(doc, {
    startY: yPosition,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      lineColor: [180, 180, 180],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
      overflow: 'linebreak',
      halign: 'center',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      cellPadding: 1
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
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

  // 🔥 CHECK PAGE SPACE - Add new page if needed
  const remainingSpace = pageHeight - yPosition - margin;
  const requiredSpace = 60; // Financial summary + bank details + transport + terms

  if (remainingSpace < requiredSpace) {
    doc.addPage();
    yPosition = 20; // Reset position on new page
  }

// Financial Summary Section
const summaryBoxHeight = 35; // ✅ Increased height for more content

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

// ✅ Show discount note clearly
if (this.discountPercentage > 0) {
  doc.setFontSize(7);
  doc.setTextColor(34, 139, 34); // Green color
  doc.setFont('helvetica', 'bold');
  doc.text(`Note: ${this.discountPercentage}% discount applied on product rates (Approx. Total Discount: Rs.${this.calculateActualDiscount().toFixed(2)})`, margin + 3, yPosition + 25);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}


// Amount breakdown
const rightBoxX = margin + contentWidth * 0.6 + 2;
const rightBoxWidth = contentWidth * 0.4 - 2;
doc.rect(rightBoxX, yPosition, rightBoxWidth, summaryBoxHeight);

doc.setFont('helvetica', 'normal');
doc.setFontSize(8);
let summaryY = yPosition + 6;

// ✅ SIMPLIFIED: Only show what's actually charged
const summaryItems = [
  ['Taxable Amount', totals.totalTaxable.toFixed(2)],
  [`Add: ${this.isIntraState ? 'CGST + SGST' : 'IGST'}`, this.totalGSTAmount.toFixed(2)],
  ['Total (Incl. Tax)', this.totalAmountInclTax.toFixed(2)]
];

// ✅ Only add additional discount if it exists (on top of line-item discount)
// if (this.invoiceData.discountApplied > 0) {
//   summaryItems.push(['Less: Additional Discount', this.invoiceData.discountApplied.toFixed(2)]);
// }

// ✅ Only add credit note if it exists
if ((this.responseData?.totalCreditNoteAmountUsed || 0) > 0) {
  summaryItems.push(['Less: Credit Note', (this.responseData?.totalCreditNoteAmountUsed || 0).toFixed(2)]);
}

summaryItems.forEach(([label, amount]) => {
  doc.text(label, rightBoxX + 2, summaryY);
  doc.text(amount, pageWidth - margin - 3, summaryY, { align: 'right' });
  summaryY += 3;
});

// Final amount - HIGHLIGHTED
summaryY += 2;
doc.setFont('helvetica', 'bold');
doc.setFontSize(10);
doc.setTextColor(0, 32, 128); // Navy blue
doc.text('Total Pay Amount', rightBoxX + 2, summaryY);
const finalAmountText = `Rs.${this.totalPayAmount.toFixed(2)}`;
doc.text(finalAmountText, pageWidth - margin - 3, summaryY, { align: 'right' });
doc.setTextColor(0, 0, 0);

  yPosition += summaryBoxHeight + 15;

  // 🔥 CHECK PAGE SPACE AGAIN before bank details
  const remainingSpace2 = pageHeight - yPosition - margin;
  const requiredSpace2 = 40; // Bank details + transport + terms

  if (remainingSpace2 < requiredSpace2) {
    doc.addPage();
    yPosition = 20;
  }

  // Bottom Section - Bank Details & Certificate
  const bottomBoxHeight = 25;
  
  // Bank Details - Now takes more width since no QR code
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

  // Certificate Area - Now starts after bank details
  // const certX = margin + contentWidth * 0.6 + 5;
  // const certWidth = pageWidth - margin - certX;
  // doc.rect(certX, yPosition, certWidth, bottomBoxHeight);
  
  // doc.setFontSize(7);
  // doc.text('Certified that the particulars given above', certX + 2, yPosition + 6);
  // doc.text('are true and correct.', certX + 2, yPosition + 9);
  
  // doc.setFont('helvetica', 'bold');
  // doc.text(`For ${this.invoiceData.sellerName}`, certX + 2, yPosition + 14);
  
  // doc.setDrawColor(0, 0, 0);
  // doc.setLineWidth(0.2);
  // doc.line(certX + 2, yPosition + 20, certX + certWidth - 2, yPosition + 20);
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(6);
  // doc.text('Authorised Signatory', certX + certWidth/2, yPosition + 23, { align: 'center' });

  yPosition += bottomBoxHeight + 8;

  // 🔥 FIXED: Transport Details (Always printed)
  if (this.invoiceData.transportDetails) {
    // Check space for transport section
    const transportSpace = pageHeight - yPosition - margin;
    if (transportSpace < 20) {
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

  // 🔥 FIXED: Terms and Conditions (Always printed)
  // Check space for terms section
  const termsSpace = pageHeight - yPosition - margin;
  if (termsSpace < 15) {
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

  // 🔥 ADD THIS CODE - Computer Generated Disclaimer
  // Check space for disclaimer
  const disclaimerSpace = pageHeight - yPosition - margin;
  if (disclaimerSpace < 10) {
    doc.addPage();
    yPosition = 20;
  }

  // Add separator line
  yPosition += 3;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Add disclaimer text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  const disclaimerText = 'This is a computer-generated invoice and does not require signature.';
  doc.text(disclaimerText, pageWidth/2, yPosition, { align: 'center' });
  yPosition += 5;

  // Save PDF
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

  /**
   * Persist status change: statusAll = 'delivered' and set invoiceRecievedDate = now.
   * Then update local UI state to show Return Product button for retailers.
   */
  markInvoiceReceived() {
    const url = `pi-manufacture-to-retailer/${this.invoiceId}`; // PATCH invoice resource
    const payload: any = {
      statusAll: 'delivered',
      invoiceRecievedDate: new Date().toISOString()
    };

    this.loading = true;
    // Prefer PATCH; if not available in AuthService, switch to PUT/POST as per backend.
    (this.authService as any).patchpimage(url, payload).subscribe(
      (res: any) => {
        // Notify success
        this.communicationService.customSuccess1('Invoice marked as received'); 
        // Update local cache/state
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
