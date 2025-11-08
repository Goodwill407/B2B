import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';

// Add BankDetails interface
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

// Add Manufacturer interface for manufacturerProfile
interface ManufacturerProfile {
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

@Component({
  selector: 'app-confirmed-mto-po-mfg-ret',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, RouterModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './confirmed-mto-po-mfg-ret.component.html',
  styleUrl: './confirmed-mto-po-mfg-ret.component.scss'
})
export class ConfirmedMtoPoMfgRetComponent implements OnInit {
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
    totalInWords: '',
  };

  responseData: any; // New variable to store response data
  poId: string;
  userProfile: any;

  // Add bank details and manufacturer profile properties
  bankDetails!: BankDetails;
  manufacturerProfile!: ManufacturerProfile;

  isIntraState: boolean = false;
  expDeliveryDate: Date | string = '';
  manufacturerNote: string = '';

  // Additional properties for MTO functionality
  statusAll: string = '';
  previousPoId: string = '';
  previousPoNumber: string = '';

  invoiceGenerated: boolean = false;
  generatedInvoiceId: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe
  ) {
    this.poId = this.route.snapshot.paramMap.get('id') ?? '';
    this.router.routeReuseStrategy.shouldReuseRoute = () => false; //This line to reload source PO when we are on Make to Order PO
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.poId);
  }

  getAllProducts(poId: string) {
    const url = `po-retailer-to-manufacture/${poId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        const productSet = res.set || [];

        const filteredProductSet = productSet.filter((item: any) =>
          item.quantity && parseInt(item.quantity) > 0
        );

        // Basic PO info - using the same structure as reference
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierGSTIN: res.manufacturer.GSTIN || '',
          supplierEmail: res.manufacturer.email,
          supplierPAN: this.extractPanFromGstin(res.manufacturer.GSTIN) || res.manufacturer.PAN || '',

          buyerName: res.retailer.companyName,
          buyerAddress: `${res.retailer.address}, ${res.retailer.pinCode} - ${res.retailer.state}`,
          buyerPhone: res.retailer.mobNumber,
          buyerEmail: res.retailer.email,
          buyerGSTIN: res.retailer.GSTIN,
          buyerPAN: this.extractPanFromGstin(res.retailer.GSTIN) || res.retailer.PAN || '',

          logoUrl: res.retailer.logo || '',
          poDate: new Date(res.retailerPoDate).toLocaleDateString(),
          orderNumber: res.poNumber,
          products: filteredProductSet,
          ProductDiscount: parseFloat(res.discount || res.retailer.productDiscount || 0),

          transportDetails: res.transportDetails,
        };
        this.generatedInvoiceId = res.invoiceId || '';

        this.expDeliveryDate = res.expDeliveryDate || res.expectedDeliveryDate || res.deliveryDate || '';
        this.manufacturerNote = res.manufacturerNote || res.note || res.manufacturer?.notes || '';

        // Store manufacturer profile for bank details display
        this.manufacturerProfile = res.manufacturer;

        // MTO specific properties
        this.statusAll = res.statusAll || '';
        this.previousPoId = res.previousPoId || '';
        this.previousPoNumber = res.previousPoNumber || '';

        this.invoiceGenerated = res.invoiceGenerated || false;

        // Map bank details
        if (res.bankDetails || res.manufacturer?.bankDetails) {
          const bankData = res.bankDetails || res.manufacturer.bankDetails;
          this.bankDetails = {
            accountHolderName: bankData.accountHolderName,
            accountNumber: bankData.accountNumber,
            accountType: bankData.accountType,
            bankName: bankData.bankName,
            branchName: bankData.branchName,
            ifscCode: bankData.ifscCode,
            swiftCode: bankData.swiftCode,
            upiId: bankData.upiId,
            bankAddress: bankData.bankAddress
          };
        }

        // Update state type
        this.updateStateType();
      },
      (err) => {
        console.error('Error:', err);
      }
    );
  }

  updateStateType() {
    const buyerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = buyerState && supplierState && (buyerState === supplierState);
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  get orderTotals() {
  let totalQty = 0;
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;
  let totalWithGST = 0;

  for (const item of this.purchaseOrder.products) {
    const gst = this.getGstAmounts(item);
    totalQty += Number(item.quantity) || 0;
    totalTaxable += gst.taxable || 0;
    totalCGST += gst.cgst || 0;
    totalSGST += gst.sgst || 0;
    totalIGST += gst.igst || 0;
    totalWithGST += gst.totalWithGst || 0;
  }

  return { 
    totalQty: isNaN(totalQty) ? 0 : totalQty,
    totalTaxable: isNaN(totalTaxable) ? 0 : totalTaxable,
    totalCGST: isNaN(totalCGST) ? 0 : totalCGST,
    totalSGST: isNaN(totalSGST) ? 0 : totalSGST,
    totalIGST: isNaN(totalIGST) ? 0 : totalIGST,
    totalWithGST: isNaN(totalWithGST) ? 0 : totalWithGST
  };
}

  getGstAmounts(item: any) {
  // Add null/undefined checks and default values
  const quantity = Number(item.quantity) || 0;
  const rate = Number(item.price) || 0;
  const gstRate = Number(item.hsnGst) || 0; // Default GST rate to 0 if not provided
  
  const taxable = quantity * rate;

  let cgst = 0, sgst = 0, igst = 0;

  if (this.isIntraState) {
    cgst = (taxable * gstRate / 2) / 100;
    sgst = (taxable * gstRate / 2) / 100;
  } else {
    igst = (taxable * gstRate) / 100;
  }

  const totalWithGst = taxable + cgst + sgst + igst;
  
  return { 
    taxable: isNaN(taxable) ? 0 : taxable, 
    gstRate: isNaN(gstRate) ? 0 : gstRate, 
    cgst: isNaN(cgst) ? 0 : cgst, 
    sgst: isNaN(sgst) ? 0 : sgst, 
    igst: isNaN(igst) ? 0 : igst, 
    totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst 
  };
}

get discountAmount(): number {
  const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
  const discount = (this.orderTotals.totalWithGST * discountPercent) / 100;
  return isNaN(discount) ? 0 : discount;
}

get actualGrandTotal(): number {
  const total = this.orderTotals.totalWithGST - this.discountAmount;
  return isNaN(total) ? 0 : total;
}

get totalGSTAmount(): number {
  const totals = this.orderTotals;
  const total = totals.totalCGST + totals.totalSGST + totals.totalIGST;
  return isNaN(total) ? 0 : total;
}

  // NEW METHOD: Generate Invoice (from GenRetailerOrderPoComponent)
  async generateInvoice() {
    const invoicePayload = {
      poId: this.poId,
      poNumber: this.purchaseOrder.orderNumber,
      invoiceNumber: `INV-${this.purchaseOrder.orderNumber}-${Date.now()}`,
      invoiceDate: new Date().toISOString(),
      statusAll: "created",
      bankDetails: {
        accountHolderName: this.manufacturerProfile.companyName,
        accountNumber: this.bankDetails.accountNumber,
        bankName: this.bankDetails.bankName,
        branchName: this.bankDetails.branchName,
        accountType: this.bankDetails.accountType,
        ifscCode: this.bankDetails.ifscCode,
        swiftCode: this.bankDetails.swiftCode,
        upiId: this.bankDetails.upiId || "",
        bankAddress: this.bankDetails.bankAddress
      },
      manufacturerEmail: this.manufacturerProfile.email,
      retailerEmail: this.purchaseOrder.buyerEmail,
      deliveryItems: this.purchaseOrder.products
        .filter((item: any) => item.quantity > 0)
        .map((item: any) => ({
          designNumber: item.designNumber,
          colour: item.colour,
          colourName: item.colourName,
          colourImage: item.colourImage,
          size: item.size,
          quantity: item.quantity,
          productType: item.productType,
          gender: item.gender,
          clothing: item.clothing,
          brandName: item.brandName,
          price: item.price, 
          subCategory: item.clothing,
          hsnCode: item.hsnCode,
          hsnGst: item.hsnGst,
          hsnDescription: `${item.gender}'s ${item.clothing}`,
          status: "pending"
        })),
      manufacturer: this.manufacturerProfile,
      retailer: {
        email: this.purchaseOrder.buyerEmail,
        fullName: this.purchaseOrder.buyerName,
        companyName: this.purchaseOrder.buyerName,
        address: this.purchaseOrder.buyerAddress,
        state: this.responseData?.retailer?.state || "",
        country: "India",
        pinCode: this.responseData?.retailer?.pinCode || "",
        mobNumber: this.purchaseOrder.buyerPhone,
        GSTIN: this.purchaseOrder.buyerGSTIN,
        logo: this.purchaseOrder.logoUrl,
        productDiscount: this.purchaseOrder.ProductDiscount.toString(),
        category: "Retail"
      },
      totalQuantity: this.purchaseOrder.products.reduce((sum: number, item: any) => sum + item.quantity, 0),
      transportDetails: this.purchaseOrder.transportDetails,
      totalAmount: this.orderTotals.totalWithGST,
      discountApplied: this.discountAmount,  
      finalAmount: this.actualGrandTotal,
    
      // totalAmount: this.orderTotals.totalWithGST,  // ✅ Amount INCLUDING all GST
      // discountApplied: (this.orderTotals.totalWithGST * this.purchaseOrder.ProductDiscount) / 100,  // ✅ Discount on total with tax
      // finalAmount: this.orderTotals.totalWithGST - ((this.orderTotals.totalWithGST * this.purchaseOrder.ProductDiscount) / 100),  // ✅ OR use this.actualGrandTotal
      returnRequestGenerated:"false",
    };

   try {
    // Generate Invoice
    const invoiceResponse = await this.authService.post('pi-manufacture-to-retailer', invoicePayload).toPromise();
    
    // Capture invoice ID from response
    const invoiceId = invoiceResponse.id; //|| invoiceResponse._id || invoiceResponse.invoiceId;
    
    // Update PO with both invoiceGenerated flag AND invoiceId
    await this.authService.patchpimage(`po-retailer-to-manufacture/${this.poId}`, { 
      invoiceGenerated: true,
      invoiceId: invoiceId  // Store the invoice ID in PO record
    }).toPromise();
    
    this.invoiceGenerated = true;
    
    // Store invoice ID in component for immediate use
    this.generatedInvoiceId = invoiceId;
    
    this.communicationService.customSuccess('Invoice generated successfully!');
    
  } catch (error) {
    console.error('Invoice generation or PO update failed:', error);
    this.communicationService.customError1('Invoice generation failed');
  }


  }

  viewInvoice() {
  // Navigate to invoice view page
  this.router.navigate(['/mnf/new/mfg-proforma-invoice-view', this.generatedInvoiceId]);
  // OR open in new tab
  // window.open(`/invoice-view/${this.poId}`, '_blank');
}


  // Helper calculation methods
  getTotalAmount(): number {
  const total = this.purchaseOrder.products.reduce((total: number, item: any) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const itemTotal = quantity * price;
    return total + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);
  return isNaN(total) ? 0 : total;
}

getTotalWithGST(): number {
  const total = this.purchaseOrder.products.reduce((total: number, item: any) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const hsnGst = Number(item.hsnGst) || 0;
    
    const itemTotal = quantity * price;
    const gstAmount = (itemTotal * hsnGst) / 100;
    const totalWithGst = itemTotal + gstAmount;
    
    return total + (isNaN(totalWithGst) ? 0 : totalWithGst);
  }, 0);
  return isNaN(total) ? 0 : total;
}

  downloadPO() {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Order Info - Right aligned
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Date: ${this.purchaseOrder.poDate}`, pageWidth - 20, yPosition, { align: 'right' });
    doc.text(`Order No: ${this.purchaseOrder.orderNumber}`, pageWidth - 20, yPosition + 5, { align: 'right' });
    yPosition += 20;

    // Buyer and Seller Information
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order By :', 20, yPosition);
    doc.text('Order To :', 110, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Buyer Info (Left Column)
    const buyerInfo = [
      this.purchaseOrder.buyerName || '',
      this.purchaseOrder.buyerAddress || '',
      `Phone: ${this.purchaseOrder.buyerPhone || 'N/A'}`,
      `Email: ${this.purchaseOrder.buyerEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.buyerGSTIN || 'N/A'}`,
      `PAN: ${this.purchaseOrder.buyerPAN || 'N/A'}`
    ];

    // Supplier Info (Right Column)
    const supplierInfo = [
      this.purchaseOrder.supplierName || '',
      this.purchaseOrder.supplierAddress || '',
      `Phone: ${this.purchaseOrder.supplierContact || 'N/A'}`,
      `Email: ${this.purchaseOrder.supplierEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.supplierGSTIN || 'N/A'}`,
      `PAN: ${this.purchaseOrder.supplierPAN || 'N/A'}`
    ];

    for (let i = 0; i < Math.max(buyerInfo.length, supplierInfo.length); i++) {
      if (buyerInfo[i]) doc.text(buyerInfo[i], 20, yPosition);
      if (supplierInfo[i]) doc.text(supplierInfo[i], 110, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // Products Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Dynamic table headers and column widths based on GST type
    let tableHeaders: string[];
    let columnWidths: number[];

    if (this.isIntraState) {
      tableHeaders = ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size', 'Rate (Rs.)', 'Qty', 'Taxable (Rs.)', 'GST%', 'CGST (Rs.)', 'SGST (Rs.)', 'Total (Rs.)'];
      columnWidths = [8, 20, 15, 15, 12, 12, 18, 10, 20, 12, 18, 18, 22];
    } else {
      tableHeaders = ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size', 'Rate (Rs.)', 'Qty', 'Taxable (Rs.)', 'GST%', 'IGST (Rs.)', 'Total (Rs.)'];
      columnWidths = [8, 22, 16, 16, 14, 14, 20, 12, 22, 14, 22, 24];
    }

    // Prepare table data
    const tableData = this.purchaseOrder.products.map((item: any, index: number) => {
      const gstAmounts = this.getGstAmounts(item);

      const baseRow = [
        (index + 1).toString(),
        item.designNumber || '',
        item.hsnCode || '',
        item.colourName || '',
        item.gender || '',
        item.size || '',
        (parseFloat(item.price) || 0).toFixed(2),
        item.quantity?.toString() || '0',
        gstAmounts.taxable?.toFixed(2) || '0.00',
        `${item.hsnGst || 0}%`
      ];

      if (this.isIntraState) {
        return [
          ...baseRow,
          gstAmounts.cgst?.toFixed(2) || '0.00',
          gstAmounts.sgst?.toFixed(2) || '0.00',
          gstAmounts.totalWithGst?.toFixed(2) || '0.00'
        ];
      } else {
        return [
          ...baseRow,
          gstAmounts.igst?.toFixed(2) || '0.00',
          gstAmounts.totalWithGst?.toFixed(2) || '0.00'
        ];
      }
    });

    // Add totals row
    const totals = this.orderTotals;
    let totalRow: string[];

    if (this.isIntraState) {
      totalRow = ['', '', '', '', '', '', 'Total:', totals.totalQty.toString(), totals.totalTaxable.toFixed(2), '',
        totals.totalCGST.toFixed(2), totals.totalSGST.toFixed(2), totals.totalWithGST.toFixed(2)];
    } else {
      totalRow = ['', '', '', '', '', '', 'Total:', totals.totalQty.toString(), totals.totalTaxable.toFixed(2), '',
        totals.totalIGST.toFixed(2), totals.totalWithGST.toFixed(2)];
    }

    tableData.push(totalRow);

    // Generate table with proper column widths
    autoTable(doc, {
      startY: yPosition,
      head: [tableHeaders],
      body: tableData,
      columnStyles: this.getColumnStyles(),
      styles: {
        fontSize: 8,
        cellPadding: 1.5,
        overflow: 'linebreak',
        halign: 'center',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [240, 246, 249],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 7
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      didParseCell: (data) => {
        // Highlight total row
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [220, 235, 255];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 8;
        }
      },
      margin: { top: 10, right: 10, bottom: 30, left: 10 }
    });

    // Get final Y position after table
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Check if we need a new page for financial summary
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 30;
    }

    // Financial Summary - Better positioned and formatted
    this.addFinancialSummary(doc, yPosition, pageWidth);
    yPosition += 40;

    // Transport Details
    if (this.purchaseOrder.transportDetails) {
      // Check if we need a new page for transport details
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }
      yPosition = this.addTransportDetails(doc, yPosition, pageWidth);
      yPosition += 20;
    }

    // Bank Details
    if (this.bankDetails) {
      // Check if we need a new page for bank details
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 30;
      }
      this.addBankDetails(doc, yPosition, pageWidth);
    }

    // Save PDF
    const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
    const poNumber = this.purchaseOrder.orderNumber || 'no-number';
    doc.save(`PO_${poDate}_${poNumber}.pdf`);
  }

  // Helper method for column styles
  getColumnStyles(): { [key: string]: Partial<any> } {
    const baseStyles = {
      6: { halign: 'right' as const }, // Rate
      7: { halign: 'center' as const }, // Qty
      8: { halign: 'right' as const }, // Taxable
      9: { halign: 'center' as const }, // GST%
      10: { halign: 'right' as const }, // CGST/IGST
      11: { halign: 'right' as const } // SGST/Total
    };

    // Add column 12 only for intra-state (CGST/SGST scenario)
    if (this.isIntraState) {
      return {
        ...baseStyles,
        12: { halign: 'right' as const } // Total column for intra-state
      };
    }

    // For inter-state (IGST scenario) - don't include column 12
    return baseStyles;
  }

  // Helper method for financial summary
  addFinancialSummary(doc: jsPDF, startY: number, pageWidth: number) {
    const totals = this.orderTotals;
    const rightAlign = pageWidth - 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text(`Subtotal: Rs. ${totals.totalWithGST.toFixed(2)}`, rightAlign, startY, { align: 'right' });

    // Discount
    doc.text(`Discount (${this.purchaseOrder.ProductDiscount}%): - Rs. ${this.discountAmount.toFixed(2)}`,
      rightAlign, startY + 6, { align: 'right' });

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${this.actualGrandTotal.toFixed(2)}`, rightAlign, startY + 15, { align: 'right' });

    // Amount in Words - Left aligned
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const amountInWords = this.amountInWordsPipe.transform(this.actualGrandTotal);
    doc.text(`Amount in Words: ${amountInWords}`, 20, startY + 25);

    doc.text(`Total GST: Rs. ${this.totalGSTAmount.toFixed(2)} - ${this.amountInWordsPipe.transform(this.totalGSTAmount)}`,
      20, startY + 30);
  }

  // Helper method for transport details
  addTransportDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Details', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const transport = this.purchaseOrder.transportDetails;

    // Left column transport info
    const leftInfo = [
      `Transport Type: ${transport.transportType || 'N/A'}`,
      `Company: ${transport.transporterCompanyName || 'N/A'}`,
      `Contact Person: ${transport.contactPersonName || 'N/A'}`,
      `Contact: ${transport.contactNumber || 'N/A'}`,
      `Alt Contact: ${transport.altContactNumber || 'N/A'}`
    ];

    // Right column transport info
    const rightInfo = [
      `Vehicle Number: ${transport.vehicleNumber || 'N/A'}`,
      `Tracking ID: ${transport.trackingId || 'N/A'}`,
      `Mode: ${transport.modeOfTransport || 'N/A'}`,
      `Delivery Address: ${transport.deliveryAddress || 'N/A'}`,
      ''
    ];

    for (let i = 0; i < leftInfo.length; i++) {
      doc.text(leftInfo[i], 20, startY);
      if (rightInfo[i]) doc.text(rightInfo[i], 110, startY);
      startY += 5;
    }

    // Remarks and notes
    if (transport.remarks) {
      startY += 3;
      doc.text(`Remarks: ${transport.remarks}`, 20, startY);
      startY += 5;
    }

    if (transport.note) {
      doc.text(`Note: ${transport.note}`, 20, startY);
      startY += 5;
    }

    return startY;
  }

  // Helper method for bank details in PDF
  addBankDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details (Manufacturer)', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Left column bank info
    const leftInfo = [
      `Account Holder: ${this.bankDetails.accountHolderName || 'N/A'}`,
      `Account Number: ${this.bankDetails.accountNumber || 'N/A'}`,
      `Account Type: ${this.bankDetails.accountType || 'N/A'}`,
      `Bank Name: ${this.bankDetails.bankName || 'N/A'}`,
      `UPI ID: ${this.bankDetails.upiId || 'N/A'}`
    ];

    // Right column bank info
    const rightInfo = [
      `Branch: ${this.bankDetails.branchName || 'N/A'}`,
      `IFSC Code: ${this.bankDetails.ifscCode || 'N/A'}`,
      `Swift Code: ${this.bankDetails.swiftCode || 'N/A'}`,
      `Location: ${this.bankDetails.bankAddress || 'N/A'}`,
      ''
    ];

    for (let i = 0; i < leftInfo.length; i++) {
      doc.text(leftInfo[i], 20, startY);
      if (rightInfo[i]) doc.text(rightInfo[i], 110, startY);
      startY += 5;
    }

    return startY;
  }

  navigateFun() {
    this.location.back();
  }

  //  PAN extraction method
  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) {
      return '';
    }

    try {
      return gstin.substring(2, 12).toUpperCase();
    } catch (error) {
      console.error('Error extracting PAN from GSTIN:', error);
      return '';
    }
  }
}
