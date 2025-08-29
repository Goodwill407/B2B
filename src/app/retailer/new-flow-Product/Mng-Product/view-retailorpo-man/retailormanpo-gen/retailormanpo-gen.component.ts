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
  upiId:string;
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
  selector: 'app-retailormanpo-gen',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './retailormanpo-gen.component.html',
  styleUrl: './retailormanpo-gen.component.scss'
})
export class RetailormanpoGenComponent {
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

  mergedProducts: any[] = [];
  responseData: any; // New variable to store response data
  distributorId: string;
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  ProductDiscount: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  // Add bank details and manufacturer profile properties
  bankDetails!: BankDetails;
  manufacturerProfile!: ManufacturerProfile;

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  sgst: any
  igst: any
  cgst: any

  isIntraState: boolean = false;

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

  getAllProducts(distributorId: string) {
    const url = `po-retailer-to-manufacture/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        const productSet = res.set || [];

        // Basic PO info - using the same structure as reference
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierGSTIN: res.manufacturer.GSTIN || '',
          supplierEmail: res.manufacturer.email,
          supplierPAN: '',

          buyerName: res.retailer.companyName,
          buyerAddress: `${res.retailer.address}, ${res.retailer.pinCode} - ${res.retailer.state}`,
          buyerPhone: res.retailer.mobNumber,
          buyerEmail: res.retailer.email,
          buyerGSTIN: res.retailer.GSTIN,
          buyerPAN: '',

          logoUrl: res.retailer.logo || '',
          poDate: new Date(res.retailerPoDate).toLocaleDateString(),
          orderNumber: res.poNumber,
          products: productSet,
          ProductDiscount: parseFloat(res.discount || res.retailer.productDiscount || 0),

          transportDetails: res.transportDetails,
        };

        // Store manufacturer profile for bank details display
        this.manufacturerProfile = res.manufacturer;

        // Map bank details (assuming it comes from the API response)
        if (res.bankDetails || res.manufacturer?.bankDetails) {
          const bankData = res.bankDetails || res.manufacturer.bankDetails;
          this.bankDetails = {
            accountHolderName:bankData.accountHolderName,
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

    return { totalQty, totalTaxable, totalCGST, totalSGST, totalIGST, totalWithGST };
  }

  getGstAmounts(item: any) {
    const quantity = +item.quantity;
    const rate = +item.price;
    const taxable = quantity * rate;
    const gstRate = +item.hsnGst;

    let cgst = 0, sgst = 0, igst = 0;

    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }

    const totalWithGst = taxable + cgst + sgst + igst;
    return { taxable, gstRate, cgst, sgst, igst, totalWithGst };
  }

  get discountAmount(): number {
    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    return (this.orderTotals.totalWithGST * discountPercent) / 100;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST - this.discountAmount;
  }

  get totalGSTAmount(): number {
    const totals = this.orderTotals;
    return totals.totalCGST + totals.totalSGST + totals.totalIGST;
  }

  downloadPO() {
    const doc = new jsPDF('p', 'mm', 'a4');
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth/2, yPosition, { align: 'center' });
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
      `GSTIN: ${this.purchaseOrder.buyerGSTIN || 'N/A'}`
    ];

    // Supplier Info (Right Column)
    const supplierInfo = [
      this.purchaseOrder.supplierName || '',
      this.purchaseOrder.supplierAddress || '',
      `Phone: ${this.purchaseOrder.supplierContact || 'N/A'}`,
      `Email: ${this.purchaseOrder.supplierEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.supplierGSTIN || 'N/A'}`
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
    doc.text('Order Details', pageWidth/2, yPosition, { align: 'center' });
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
    doc.text('Transport Details', pageWidth/2, startY, { align: 'center' });
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

  // NEW METHOD: Helper method for bank details in PDF
  addBankDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details (Manufacturer)', pageWidth/2, startY, { align: 'center' });
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

  discountedTotal: number = 0; // Add this property
  
  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;
  
    // Loop through each size header and calculate the total price
    this.sizeHeaders.forEach((size) => {
      // If there is a quantity for the current size, add to the total
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });
  
    // Apply the discount if flag is true and discount is greater than 0
    if (applyDiscount && this.purchaseOrder.ProductDiscount > 0) {
      const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
      total -= discount;
    }
  
    // Return the final calculated total price
    return total;
  }

  addpo() {
    const cartBody = { ...this.responseData };
    // Create a copy of the response data
  
    // Remove unwanted fields
    delete cartBody.__v;
    delete cartBody._id;
    delete cartBody.productId;
    // if (cartBody.set && Array.isArray(cartBody.set)) {
    //   cartBody.set.forEach((product: any) => {
    //     product.productBy = this.responseData.productBy; // Add productBy to each product in the set
    //   });
    // }
  
    // Post the cleaned data to the backend
    this.authService.post('po-retailer-to-manufacture', cartBody).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Purchace Order Genrated Succesfully');
      },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    );
  }

  tableChunks: any[][] = [];
  serialOffset: number[] = [];

  navigateFun() {
    this.location.back();
  }
}
