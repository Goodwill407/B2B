import { CommonModule, Location, TitleCasePipe } from '@angular/common';
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
import Swal from 'sweetalert2';

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
  profileImg?: string;
  logo?: string;
}

@Component({
  selector: 'app-confirm-mto-po-invc-gen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    TableModule,
    RouterModule,
    IndianCurrencyPipe,
    AmountInWordsPipe,
    TitleCasePipe,
  ],
  templateUrl: './confirm-mto-po-invc-gen.component.html',
  styleUrl: './confirm-mto-po-invc-gen.component.scss',
})
export class ConfirmMtoPoInvcGenComponent implements OnInit {
  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: '',
    orderNo: '',
    orderDate: new Date().toLocaleDateString(),
    deliveryDate: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
  };

  responseData: any;
  poId: string;
  userProfile: any;

  bankDetails!: BankDetails;
  manufacturerProfile!: ManufacturerProfile;

  isIntraState: boolean = false;
  expDeliveryDate: Date | string = '';
  manufacturerNote: string = '';

  invoiceGenerated: boolean = false;
  generatedInvoiceId: any;

  walletBalance: number = 0;
  walletData: any = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe
  ) {
    this.poId = this.route.snapshot.paramMap.get('id') ?? '';
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.poId);
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  getAllProducts(poId: string) {
    const url = `po-wholesaler-to-manufacture/${poId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;

        const productSet = (res.set || []).filter(
          (item: any) => item.quantity && parseInt(item.quantity) > 0
        );

        this.purchaseOrder = {
          // Manufacturer = Supplier (Order To)
          supplierName: res.manufacturer.companyName,
          supplierDetails: res.manufacturer.fullName,
          supplierAddress: `${res.manufacturer.address}, ${res.manufacturer.pinCode} - ${res.manufacturer.state}`,
          supplierContact: res.manufacturer.mobNumber,
          supplierGSTIN: res.manufacturer.GSTIN || '',
          supplierEmail: res.manufacturer.email,
          supplierPAN: this.extractPanFromGstin(res.manufacturer.GSTIN) || res.manufacturer.PAN || '',

          // Wholesaler = Buyer (Order By)
          buyerName: res.wholesaler.companyName,
          buyerAddress: `${res.wholesaler.address}, ${res.wholesaler.pinCode} - ${res.wholesaler.state}`,
          buyerPhone: res.wholesaler.mobNumber,
          buyerEmail: res.wholesaler.email,
          buyerGSTIN: res.wholesaler.GSTIN,
          buyerPAN: this.extractPanFromGstin(res.wholesaler.GSTIN) || res.wholesaler.PAN || '',

          logoUrl: res.wholesaler.logo || res.manufacturer.logo || '',
          poDate: new Date(res.wholesalerPoDate || res.createdAt).toLocaleDateString(),
          orderNumber: res.poNumber,
          products: productSet,
          ProductDiscount: parseFloat(res.discount || res.wholesaler.productDiscount || 0),
          transportDetails: res.transportDetails,
        };

        this.generatedInvoiceId = res.invoiceId || '';
        this.invoiceGenerated = res.invoiceGenerated || false;

        this.expDeliveryDate = res.expDeliveryDate || res.expectedDeliveryDate || res.deliveryDate || '';
        this.manufacturerNote = res.manufacturerNote || res.note || '';

        this.manufacturerProfile = res.manufacturer;

        // Bank Details
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
            bankAddress: bankData.bankAddress,
          };
        }

        this.updateStateType();
      },
      (err) => {
        console.error('Error fetching PO:', err);
        this.communicationService.customError1('Failed to load purchase order');
      }
    );
  }

  updateStateType() {
    const buyerState = this.responseData?.wholesaler?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    this.isIntraState = !!(buyerState && supplierState && buyerState === supplierState);
  }

  // ─── Computed Getters ────────────────────────────────────────────────────────

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  get orderTotals() {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0;
    let totalSGST = 0, totalIGST = 0, totalWithGST = 0;

    for (const item of this.purchaseOrder.products) {
      const gst = this.getGstAmounts(item);
      totalQty      += Number(item.quantity) || 0;
      totalTaxable  += gst.taxable || 0;
      totalCGST     += gst.cgst || 0;
      totalSGST     += gst.sgst || 0;
      totalIGST     += gst.igst || 0;
      totalWithGST  += gst.totalWithGst || 0;
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

  getGstAmounts(item: any) {
    const quantity       = Number(item.quantity) || 0;
    const rate           = Number(item.price) || 0;
    const gstRate        = Number(item.hsnGst) || 0;
    const discountPct    = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountedRate = rate - (rate * discountPct / 100);
    const taxable        = quantity * discountedRate;

    let cgst = 0, sgst = 0, igst = 0;
    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
    } else {
      igst = (taxable * gstRate) / 100;
    }

    const totalWithGst = taxable + cgst + sgst + igst;

    return {
      originalRate:  rate,
      discountedRate: isNaN(discountedRate) ? 0 : discountedRate,
      taxable:       isNaN(taxable)        ? 0 : taxable,
      gstRate:       isNaN(gstRate)        ? 0 : gstRate,
      cgst:          isNaN(cgst)           ? 0 : cgst,
      sgst:          isNaN(sgst)           ? 0 : sgst,
      igst:          isNaN(igst)           ? 0 : igst,
      totalWithGst:  isNaN(totalWithGst)   ? 0 : totalWithGst,
    };
  }

  get discountAmount(): number {
    const discountPct = Number(this.purchaseOrder.ProductDiscount) || 0;
    let totalWithoutDiscount = 0;
    for (const item of this.purchaseOrder.products) {
      totalWithoutDiscount += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    }
    const discount = (totalWithoutDiscount * discountPct) / 100;
    return isNaN(discount) ? 0 : discount;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST;
  }

  get totalGSTAmount(): number {
    const t = this.orderTotals;
    const total = t.totalCGST + t.totalSGST + t.totalIGST;
    return isNaN(total) ? 0 : total;
  }

  // ─── Invoice Generation ──────────────────────────────────────────────────────

  async generateInvoice() {
    try {
      const walletResponse = await this.fetchWalletBalance();
      console.log('🔍 Wallet Response:', walletResponse);

      if (walletResponse && walletResponse.balance > 0) {
        const appliedCredit = await this.showCreditApplicationPopup(walletResponse);
        if (appliedCredit !== null) {
          await this.createInvoiceWithCredit(appliedCredit);
        }
      } else {
        console.log('ℹ️ No wallet balance, generating invoice without credit');
        await this.createInvoiceWithCredit(0);
      }
    } catch (error) {
      console.error('❌ Invoice generation failed:', error);
      this.communicationService.customError1('Invoice generation failed');
    }
  }

  async fetchWalletBalance(): Promise<any> {
    const mfgEmail = this.manufacturerProfile.email;
    const wsEmail  = this.purchaseOrder.buyerEmail;
    const url = `m-to-w-wallet?manufacturerEmail=${mfgEmail}&wholesalerEmail=${wsEmail}`;

    try {
      const response = await this.authService.get(url).toPromise();
      console.log('🔍 Full Wallet API Response:', response);

      if (response && response.results && response.results.length > 0) {
        const walletData    = response.results[0];
        this.walletData     = walletData;
        this.walletBalance  = walletData.balance || 0;
        return walletData;
      }
      console.log('⚠️ No wallet found');
      return null;
    } catch (error) {
      console.error('❌ Wallet API error:', error);
      return null;
    }
  }

  async debitWalletBalance(walletId: string, amount: number, invoiceNumber: string): Promise<void> {
    if (amount <= 0) return;

    const payload = {
      amount,
      debitInvoiceNumber: invoiceNumber,
      description: `₹${amount} adjusted against Invoice #${invoiceNumber}`,
    };

    try {
      await this.authService.patchpimage(`m-to-w-wallet/debit/${walletId}`, payload).toPromise();
      console.log('✅ Wallet debited successfully');
    } catch (error) {
      console.error('❌ Wallet debit failed:', error);
      this.communicationService.customError('Invoice created but wallet update failed');
    }
  }

  async showCreditApplicationPopup(walletData: any): Promise<number | null> {
    const maxCredit = Math.min(walletData.balance, this.actualGrandTotal);

    const result = await Swal.fire({
      title: 'Apply Wallet Credit',
      html: `
        <div style="text-align:left; padding:10px;">
          <div style="background:#e8f5e9; padding:12px; border-radius:6px; margin-bottom:15px;">
            <strong style="color:#2e7d32;">💰 Available Wallet Balance:</strong>
            <span style="font-size:20px; color:#1b5e20; font-weight:bold; float:right;">
              ₹ ${walletData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style="background:#fff3e0; padding:12px; border-radius:6px; margin-bottom:15px;">
            <strong style="color:#e65100;">📄 Invoice Total Amount:</strong>
            <span style="font-size:20px; color:#bf360c; font-weight:bold; float:right;">
              ₹ ${this.actualGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style="margin:20px 0;">
            <label style="display:block; margin-bottom:8px; font-weight:600; color:#333;">
              Enter Credit Amount to Apply:
            </label>
            <input id="creditAmountInput" type="number" class="swal2-input"
              placeholder="Enter amount (max: ${maxCredit})"
              min="0" max="${maxCredit}" step="0.01"
              style="width:90%; padding:10px; font-size:16px; margin:0;" />
            <small style="color:#666; display:block; margin-top:5px;">
              Maximum applicable: ₹ ${maxCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </small>
          </div>
          <hr style="margin:20px 0; border:none; border-top:2px solid #ddd;">
          <div id="finalPayableSection" style="background:#e3f2fd; padding:12px; border-radius:6px; display:none;">
            <strong style="color:#0277bd;">💳 Final Payable Amount:</strong>
            <span id="finalPayableAmount" style="font-size:22px; color:#01579b; font-weight:bold; float:right;">
              ₹ ${this.actualGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Apply & Generate Invoice',
      cancelButtonText: 'Skip & Generate',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: true,
      allowEscapeKey: true,
      didOpen: () => {
        const input         = document.getElementById('creditAmountInput') as HTMLInputElement;
        const finalSection  = document.getElementById('finalPayableSection') as HTMLElement;
        const finalAmount   = document.getElementById('finalPayableAmount') as HTMLElement;

        input?.addEventListener('input', () => {
          const value     = parseFloat(input.value) || 0;
          const remaining = this.actualGrandTotal - value;
          if (value > 0) {
            finalSection.style.display = 'block';
            finalAmount.textContent = `₹ ${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          } else {
            finalSection.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const input = document.getElementById('creditAmountInput') as HTMLInputElement;
        const value = parseFloat(input.value);

        if (isNaN(value) || value < 0) {
          Swal.showValidationMessage('Please enter a valid amount');
          return false;
        }
        if (value > walletData.balance) {
          Swal.showValidationMessage(`Amount cannot exceed wallet balance (₹${walletData.balance})`);
          return false;
        }
        if (value > this.actualGrandTotal) {
          Swal.showValidationMessage(`Amount cannot exceed invoice total (₹${this.actualGrandTotal})`);
          return false;
        }
        return value;
      },
    });

    if (result.isConfirmed)                              return result.value || 0;
    if (result.dismiss === Swal.DismissReason.cancel)    return 0;
    return null; // ESC / X / backdrop
  }

  async createInvoiceWithCredit(creditAmount: number) {
    const finalPayable = this.actualGrandTotal - creditAmount;

    const invoicePayload = {
      poId:                 this.poId,
      poNumber:             this.purchaseOrder.orderNumber,
      invoiceNumber:        `INV-M2W-${this.purchaseOrder.orderNumber}-${Date.now()}`,
      invoiceDate:          new Date().toISOString(),
      invoiceRecievedDate:  null,
      statusAll:            'created',

      manufacturerEmail:    this.manufacturerProfile.email,
      wholesalerEmail:      this.purchaseOrder.buyerEmail,

      manufacturer: {
        email:       this.manufacturerProfile.email,
        fullName:    this.manufacturerProfile.fullName,
        companyName: this.manufacturerProfile.companyName,
        address:     this.manufacturerProfile.address,
        state:       this.manufacturerProfile.state,
        country:     this.manufacturerProfile.country || 'India',
        pinCode:     this.manufacturerProfile.pinCode,
        mobNumber:   this.manufacturerProfile.mobNumber,
        GSTIN:       this.manufacturerProfile.GSTIN,
        logo:        this.manufacturerProfile.logo || '',
      },

      wholesaler: {
        email:           this.purchaseOrder.buyerEmail,
        fullName:        this.responseData?.wholesaler?.fullName || '',
        companyName:     this.purchaseOrder.buyerName,
        address:         this.responseData?.wholesaler?.address || '',
        state:           this.responseData?.wholesaler?.state  || '',
        country:         this.responseData?.wholesaler?.country || 'India',
        pinCode:         this.responseData?.wholesaler?.pinCode || '',
        mobNumber:       this.purchaseOrder.buyerPhone,
        GSTIN:           this.purchaseOrder.buyerGSTIN,
        logo:            this.purchaseOrder.logoUrl || '',
        productDiscount: this.purchaseOrder.ProductDiscount?.toString(),
        category:        this.responseData?.wholesaler?.category || 'Wholesale',
      },

      bankDetails: {
        accountHolderName: this.bankDetails.accountHolderName,
        accountNumber:     this.bankDetails.accountNumber,
        bankName:          this.bankDetails.bankName,
        branchName:        this.bankDetails.branchName,
        ifscCode:          this.bankDetails.ifscCode,
        swiftCode:         this.bankDetails.swiftCode || '',
        upiId:             this.bankDetails.upiId    || '',
        bankAddress:       this.bankDetails.bankAddress,
      },

      deliveryItems: this.purchaseOrder.products
        .filter((item: any) => item.quantity > 0)
        .map((item: any) => ({
          designNumber:   item.designNumber,
          colour:         item.colour,
          colourName:     item.colourName,
          colourImage:    item.colourImage,
          size:           item.size,
          quantity:       item.quantity,
          price:          item.price,  
          productType:    item.productType,
          gender:         item.gender,
          clothing:       item.clothing,
          brandName:      item.brandName,
          subCategory:    item.clothing,
          hsnCode:        item.hsnCode,
          hsnGst:         item.hsnGst,
          hsnDescription: `${item.gender}'s ${item.clothing}`,
          status:         'pending',
        })),

      totalQuantity:    this.purchaseOrder.products.reduce(
                          (sum: number, i: any) => sum + (Number(i.quantity) || 0), 0),
      transportDetails: this.purchaseOrder.transportDetails,

      totalAmount:               this.orderTotals.totalWithGST,
      discountApplied:           this.discountAmount,
      finalAmount:               this.actualGrandTotal,
      totalCreditNoteAmountUsed: creditAmount,
      finalAmountPayable:        finalPayable,

      returnRequestGenerated: 'false',
    };

    console.log('📤 M2W Invoice Payload:', invoicePayload);

    try {
      // Step 1 – Create Invoice
      const invoiceResponse = await this.authService
        .post('pi-manufacture-to-wholesaler', invoicePayload)
        .toPromise();

      const invoiceId     = invoiceResponse.id;
      const invoiceNumber = invoiceResponse.invoiceNumber || this.purchaseOrder.orderNumber;

      console.log('✅ Invoice created:', invoiceResponse);

      // Step 2 – Debit wallet if credit applied
      if (creditAmount > 0 && this.walletData?.id) {
        await this.debitWalletBalance(this.walletData.id, creditAmount, invoiceNumber);
      }

      // Step 3 – Update PO
      await this.authService
        .patchpimage(`po-wholesaler-to-manufacture/${this.poId}`, {
          invoiceGenerated: true,
          invoiceId,
          // statusAll: 'invoice_generated',                // status remain same
        })
        .toPromise();

      this.invoiceGenerated   = true;
      this.generatedInvoiceId = invoiceId;

      this.communicationService.customSuccess('Invoice generated successfully!');
    } catch (error) {
      console.error('❌ Invoice creation failed:', error);
      this.communicationService.customError1('Invoice generation failed');
      throw error;
    }
  }

  viewInvoice() {
    this.router.navigate(['/mnf/mfg-whl-invoice-view/', this.generatedInvoiceId]);
  }

  // ─── PDF Download ────────────────────────────────────────────────────────────

  downloadPO() {
    const doc       = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Order Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Date: ${this.purchaseOrder.poDate}`, pageWidth - 20, y, { align: 'right' });
    doc.text(`Order No: ${this.purchaseOrder.orderNumber}`, pageWidth - 20, y + 5, { align: 'right' });
    y += 20;

    // Buyer / Seller
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Order By (Wholesaler):', 20, y);
    doc.text('Order To (Manufacturer):', 110, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const buyerInfo = [
      this.purchaseOrder.buyerName,
      this.purchaseOrder.buyerAddress,
      `Phone: ${this.purchaseOrder.buyerPhone || 'N/A'}`,
      `Email: ${this.purchaseOrder.buyerEmail || 'N/A'}`,
      `GSTIN: ${this.purchaseOrder.buyerGSTIN || 'N/A'}`,
      `PAN: ${this.purchaseOrder.buyerPAN || 'N/A'}`,
    ];

    const supplierInfo = [
      this.purchaseOrder.supplierName,
      this.purchaseOrder.supplierAddress,
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

    // Products Table
    const tableHeaders = this.isIntraState
      ? ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size', 'Rate (₹)', 'Qty', 'Taxable (₹)', 'GST%', 'CGST (₹)', 'SGST (₹)', 'Total (₹)']
      : ['Sr.', 'Design No.', 'HSN', 'Colour', 'Gender', 'Size', 'Rate (₹)', 'Qty', 'Taxable (₹)', 'GST%', 'IGST (₹)', 'Total (₹)'];

    const tableData = this.purchaseOrder.products.map((item: any, idx: number) => {
      const g = this.getGstAmounts(item);
      const base = [
        (idx + 1).toString(),
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
    });

    const t = this.orderTotals;
    const totalRow = this.isIntraState
      ? ['', '', '', '', '', '', 'Total:', t.totalQty.toString(), t.totalTaxable.toFixed(2), '', t.totalCGST.toFixed(2), t.totalSGST.toFixed(2), t.totalWithGST.toFixed(2)]
      : ['', '', '', '', '', '', 'Total:', t.totalQty.toString(), t.totalTaxable.toFixed(2), '', t.totalIGST.toFixed(2), t.totalWithGST.toFixed(2)];

    tableData.push(totalRow);

    autoTable(doc, {
      startY: y,
      head: [tableHeaders],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 1.5, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [240, 246, 249], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      didParseCell: (data) => {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor   = [220, 235, 255];
          data.cell.styles.fontStyle   = 'bold';
          data.cell.styles.fontSize    = 8;
        }
      },
      margin: { top: 10, right: 10, bottom: 30, left: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 15;
    if (y > pageHeight - 60) { doc.addPage(); y = 30; }

    this.addFinancialSummary(doc, y, pageWidth);
    y += 45;

    if (this.purchaseOrder.transportDetails) {
      if (y > pageHeight - 80) { doc.addPage(); y = 30; }
      y = this.addTransportDetails(doc, y, pageWidth) + 20;
    }

    if (this.bankDetails) {
      if (y > pageHeight - 80) { doc.addPage(); y = 30; }
      this.addBankDetails(doc, y, pageWidth);
    }

    const poDate   = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
    const poNumber = this.purchaseOrder.orderNumber || 'no-number';
    doc.save(`PO_M2W_${poDate}_${poNumber}.pdf`);
  }

  addFinancialSummary(doc: jsPDF, startY: number, pageWidth: number) {
    const rightAlign = pageWidth - 20;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (this.purchaseOrder.ProductDiscount > 0) {
      doc.text(`Note: ${this.purchaseOrder.ProductDiscount}% discount applied on product rates`, 20, startY);
      doc.text(`(Total Discount: ₹ ${this.discountAmount.toFixed(2)})`, 20, startY + 5);
      startY += 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total: ₹ ${this.actualGrandTotal.toFixed(2)}`, rightAlign, startY, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount in Words: ${this.amountInWordsPipe.transform(this.actualGrandTotal)}`, 20, startY + 10);
    doc.text(`Total GST: ₹ ${this.totalGSTAmount.toFixed(2)} - ${this.amountInWordsPipe.transform(this.totalGSTAmount)}`, 20, startY + 15);
  }

  addTransportDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transport Details', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const transport = this.purchaseOrder.transportDetails;
    const left  = [`Transport Type: ${transport.transportType || 'N/A'}`, `Company: ${transport.transporterCompanyName || 'N/A'}`, `Contact Person: ${transport.contactPersonName || 'N/A'}`, `Contact: ${transport.contactNumber || 'N/A'}`, `Alt Contact: ${transport.altContactNumber || 'N/A'}`];
    const right = [`Vehicle Number: ${transport.vehicleNumber || 'N/A'}`, `Tracking ID: ${transport.trackingId || 'N/A'}`, `Mode: ${transport.modeOfTransport || 'N/A'}`, `Delivery Address: ${transport.deliveryAddress || 'N/A'}`, ''];

    for (let i = 0; i < left.length; i++) {
      doc.text(left[i], 20, startY);
      if (right[i]) doc.text(right[i], 110, startY);
      startY += 5;
    }

    if (transport.remarks) { doc.text(`Remarks: ${transport.remarks}`, 20, startY); startY += 5; }
    if (transport.note)    { doc.text(`Note: ${transport.note}`, 20, startY); startY += 5; }

    return startY;
  }

  addBankDetails(doc: jsPDF, startY: number, pageWidth: number): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bank Details (Manufacturer)', pageWidth / 2, startY, { align: 'center' });
    startY += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const left  = [`Account Holder: ${this.bankDetails.accountHolderName || 'N/A'}`, `Account Number: ${this.bankDetails.accountNumber || 'N/A'}`, `Account Type: ${this.bankDetails.accountType || 'N/A'}`, `Bank Name: ${this.bankDetails.bankName || 'N/A'}`, `UPI ID: ${this.bankDetails.upiId || 'N/A'}`];
    const right = [`Branch: ${this.bankDetails.branchName || 'N/A'}`, `IFSC Code: ${this.bankDetails.ifscCode || 'N/A'}`, `Swift Code: ${this.bankDetails.swiftCode || 'N/A'}`, `Location: ${this.bankDetails.bankAddress || 'N/A'}`, ''];

    for (let i = 0; i < left.length; i++) {
      doc.text(left[i], 20, startY);
      if (right[i]) doc.text(right[i], 110, startY);
      startY += 5;
    }

    return startY;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  navigateFun() {
    this.location.back();
  }

  extractPanFromGstin(gstin: string): string {
    if (!gstin || gstin.length !== 15) return '';
    try { return gstin.substring(2, 12).toUpperCase(); }
    catch { return ''; }
  }
}
