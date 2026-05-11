import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cp-shopk-mfg-gen-po',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './cp-shopk-mfg-gen-po.component.html',
  styleUrl: './cp-shopk-mfg-gen-po.component.scss'
})
export class CpShopkMfgGenPoComponent implements OnInit {

  // ── Route params ──────────────────────────────
  cartId = '';
  manufacturerId = '';
  manufacturerEmail = '';
  manufacturerName = '';
  shopkeeperEmail = '';
  shopkeeperName = '';

  // ── State ─────────────────────────────────────
  loading = false;
  submitting = false;
  previewData: any = null;
  currentUser: any;

  // ── PO display model ──────────────────────────
  purchaseOrder: any = {};
  products: any[] = [];

  // ── GST ───────────────────────────────────────
  isIntraState = false;
  sgst = 0;
  cgst = 0;
  igst = 0;
  Totalsub = 0;
  discountedTotal = 0;
  totalGrandTotal = 0;
  dicountprice = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private communicationService: CommunicationService,
    private amountInWordsPipe: AmountInWordsPipe
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.cartId           = params['cartId'] || '';
      this.manufacturerId   = params['manufacturerId'] || '';
      this.manufacturerEmail = params['manufacturerEmail'] || '';
      this.manufacturerName  = params['manufacturerName'] || '';
      this.shopkeeperEmail  = params['shopkeeperEmail'] || '';
      this.shopkeeperName   = params['shopkeeperName'] || '';

      if (this.cartId && this.manufacturerEmail) {
        this.getPreviewPO();
      }
    });
  }

  // ── Preview API ───────────────────────────────
  getPreviewPO(): void {
    this.loading = true;
    this.authService.post(
      `cp-cart/preview-po-single/${this.cartId}/${this.manufacturerEmail}`, {}
    ).subscribe({
      next: (res: any) => {
        this.previewData = res?.data || res;
        this.buildPurchaseOrder(this.previewData);
        this.loading = false;
      },
      error: (err) => {
        console.error('Preview PO Error:', err);
        this.loading = false;
        this.communicationService.customError1('Unable to load PO preview');
      }
    });
  }

  // ── Build display model from response ─────────
  buildPurchaseOrder(data: any): void {
    const cp           = data.cp || {};
    const shopkeeper   = data.shopkeeper || {};
    const manufacturer = data.manufacturer || {};

    this.purchaseOrder = {
      poNumber:        data.poNumber || '',
      poDate:          data.poDate ? new Date(data.poDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),

      // CP (Order By)
      cpName:          cp.companyName || cp.fullName || '',
      cpFullName:      cp.fullName || '',
      cpEmail:         cp.email || '',
      cpAddress:       `${cp.address || ''}, ${cp.city || ''}, ${cp.state || ''} - ${cp.pinCode || ''}`,
      cpState:         cp.state || '',
      cpPhone:         cp.mobNumber || '',
      cpGSTIN:         cp.GSTIN || '',
      cpPAN:           cp.pan || '',
      cpLogo:          cp.profileImg || 'assets/images/company_logo.jpg',

      // Shopkeeper (Delivery To)
      shopName:        shopkeeper.shopName || shopkeeper.companyName || shopkeeper.fullName || '',
      shopFullName:    shopkeeper.fullName || '',
      shopEmail:       shopkeeper.email || '',
      shopAddress:     `${shopkeeper.address || ''}, ${shopkeeper.city || ''}, ${shopkeeper.state || ''} - ${shopkeeper.pinCode || ''}`,
      shopState:       shopkeeper.state || '',
      shopPhone:       shopkeeper.mobileNumber || shopkeeper.mobNumber || '',
      shopGSTIN:       shopkeeper.GSTIN || '',
      shopPAN:         shopkeeper.pan || '',
      shopLogo:        shopkeeper.profileImg || '',

      // Manufacturer (Order To)
      mfgName:         manufacturer.companyName || manufacturer.fullName || '',
      mfgFullName:     manufacturer.fullName || '',
      mfgEmail:        manufacturer.email || '',
      mfgAddress:      `${manufacturer.address || ''}, ${manufacturer.city || ''}, ${manufacturer.state || ''} - ${manufacturer.pinCode || ''}`,
      mfgState:        manufacturer.state || '',
      mfgPhone:        manufacturer.mobNumber || '',
      mfgGSTIN:        manufacturer.GSTIN || '',
      mfgPAN:          manufacturer.pan || '',
      mfgLogo:         manufacturer.profileImg || '',

      discount:        data.discount || 0,
    };

    this.products = data.items || [];
    this.updateStateType(shopkeeper.state, manufacturer.state);
    this.calculateTotals();
  }

  // ── GST / Totals ──────────────────────────────
  updateStateType(shopState: string, mfgState: string): void {
    if (shopState && mfgState) {
      this.isIntraState = shopState.trim().toLowerCase() === mfgState.trim().toLowerCase();
    } else {
      this.isIntraState = false;
    }
  }

  calculateTotals(): void {
    let subtotal = 0;
    this.products.forEach(item => {
      subtotal += (item.quantity || 0) * (+item.price || 0);
    });
    this.Totalsub = subtotal;

    const discountAmt = (subtotal * (this.purchaseOrder.discount || 0)) / 100;
    this.discountedTotal = subtotal - discountAmt;
    this.dicountprice = discountAmt;
    this.calculateGST();
  }

  calculateGST(): void {
    const base = this.discountedTotal;
    if (this.isIntraState) {
      this.sgst = (base * 9) / 100;
      this.cgst = (base * 9) / 100;
      this.igst = 0;
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (base * 18) / 100;
    }
    this.totalGrandTotal = parseFloat((base + this.sgst + this.cgst + this.igst).toFixed(2));
  }

  getGstAmounts(item: any) {
    const qty      = Number(item.quantity) || 0;
    const rate     = Number(item.price) || 0;
    const gstRate  = Number(item.hsnGst) || 0;
    const discPct  = Number(this.purchaseOrder.discount) || 0;
    const discRate = rate - (rate * discPct / 100);
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
      taxable: isNaN(taxable) ? 0 : taxable,
      gstRate, cgst, sgst, igst,
      totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst
    };
  }

  get orderTotals() {
    let totalQty = 0, totalTaxable = 0, totalCGST = 0,
        totalSGST = 0, totalIGST = 0, totalWithGST = 0;
    for (const item of this.products) {
      const g = this.getGstAmounts(item);
      totalQty      += Number(item.quantity) || 0;
      totalTaxable  += g.taxable;
      totalCGST     += g.cgst;
      totalSGST     += g.sgst;
      totalIGST     += g.igst;
      totalWithGST  += g.totalWithGst;
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
    let totalWithout = 0;
    for (const item of this.products) {
      totalWithout += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    }
    return (totalWithout * (Number(this.purchaseOrder.discount) || 0)) / 100;
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  // ── Transport Swal ────────────────────────────
  async postTransporterDetails(): Promise<any> {
    const { value: transportType } = await Swal.fire({
      title: 'Select Transport Type',
      input: 'select',
      inputOptions: { self: 'Self', third: '3rd Party' },
      inputPlaceholder: 'Select transport type',
      showCancelButton: true,
      confirmButtonText: 'Continue',
      allowOutsideClick: false,
      inputValidator: (v) => !v ? 'Please select a transport type!' : null
    });

    if (!transportType) return null;

    if (transportType === 'self') {
      return {
        transportType: 'Self',
        modeOfTransport: 'self',
        transporterCompanyName: this.purchaseOrder.cpName,
        contactNumber: parseInt(this.purchaseOrder.cpPhone) || 0,
      };
    }

    const { value: formValues } = await Swal.fire({
      title: 'Transporter Details',
      html: `
        <div style="text-align:left; max-height:420px; overflow-y:auto;">
          <label><strong>Mode of Transport *</strong></label>
          <select id="mot" class="swal2-input" style="width:85%">
            <option value="">Select</option>
            <option value="road">Road</option>
            <option value="railway">Railway</option>
            <option value="air">Air</option>
            <option value="sea">Sea</option>
            <option value="other">Other</option>
          </select>
          <label><strong>Transporter Company Name *</strong></label>
          <input id="tcn" class="swal2-input" placeholder="Company name" style="width:80%">
          <label><strong>Contact Person Name *</strong></label>
          <input id="cpn" class="swal2-input" placeholder="Contact person" style="width:80%">
          <label><strong>Contact Number *</strong></label>
          <input id="cn" class="swal2-input" type="tel" max="10" placeholder="10-digit number" style="width:80%">
          <label>Vehicle Number</label>
          <input id="vn" class="swal2-input" placeholder="Vehicle number" style="width:80%">
          <label>Tracking ID</label>
          <input id="ti" class="swal2-input" placeholder="Tracking / AWB / LR" style="width:80%">
          <label>Delivery Address</label>
          <textarea id="da" class="swal2-textarea" style="width:80%;height:60px">${this.purchaseOrder.shopAddress || ''}</textarea>
          <label>Remarks</label>
          <textarea id="rem" class="swal2-textarea" style="width:80%;height:50px"></textarea>
          <label>Broker Note</label>
          <textarea id="note" class="swal2-textarea" style="width:80%;height:50px"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      width: '600px',
      allowOutsideClick: false,
      preConfirm: () => {
        const mot = (document.getElementById('mot') as HTMLSelectElement).value;
        const tcn = (document.getElementById('tcn') as HTMLInputElement).value;
        const cpn = (document.getElementById('cpn') as HTMLInputElement).value;
        const cn  = (document.getElementById('cn') as HTMLInputElement).value;
        if (!mot) { Swal.showValidationMessage('Mode of Transport is required'); return false; }
        if (!tcn) { Swal.showValidationMessage('Company Name is required'); return false; }
        if (!cpn) { Swal.showValidationMessage('Contact Person is required'); return false; }
        if (!cn || !/^\d{10}$/.test(cn)) { Swal.showValidationMessage('Valid 10-digit number required'); return false; }
        return {
          transportType: '3rd Party',
          modeOfTransport: mot,
          transporterCompanyName: tcn,
          contactPersonName: cpn,
          contactNumber: parseInt(cn),
          vehicleNumber: (document.getElementById('vn') as HTMLInputElement).value || undefined,
          trackingId: (document.getElementById('ti') as HTMLInputElement).value || undefined,
          deliveryAddress: (document.getElementById('da') as HTMLTextAreaElement).value || undefined,
          remarks: (document.getElementById('rem') as HTMLTextAreaElement).value || undefined,
          note: (document.getElementById('note') as HTMLTextAreaElement).value || undefined,
        };
      }
    });
    return formValues || null;
  }

  // ── Generate PO ───────────────────────────────
  async generatePO(): Promise<void> {
    const transportDetails = await this.postTransporterDetails();
    if (!transportDetails) return;

    this.submitting = true;
    const d = this.previewData;

    const body: any = {
      cartId:            this.cartId,
      manufacturerEmail: this.manufacturerEmail,

      cp: {
        email:       d.cp?.email,
        fullName:    d.cp?.fullName,
        companyName: d.cp?.companyName,
        address:     d.cp?.address,
        state:       d.cp?.state,
        country:     d.cp?.country || 'India',
        pinCode:     d.cp?.pinCode,
        mobNumber:   d.cp?.mobNumber,
        GSTIN:       d.cp?.GSTIN,
      },
      shopkeeper: {
        email:    d.shopkeeper?.email,
        fullName: d.shopkeeper?.fullName,
        shopName: d.shopkeeper?.shopName,
        address:  d.shopkeeper?.address,
        city:     d.shopkeeper?.city,
        state:    d.shopkeeper?.state,
        pinCode:  d.shopkeeper?.pinCode,
        mobNumber: d.shopkeeper?.mobileNumber || d.shopkeeper?.mobNumber,
        GSTIN:    d.shopkeeper?.GSTIN,
      },
      manufacturer: {
        email:       d.manufacturer?.email,
        fullName:    d.manufacturer?.fullName,
        companyName: d.manufacturer?.companyName,
        address:     d.manufacturer?.address,
        state:       d.manufacturer?.state,
        country:     d.manufacturer?.country || 'India',
        pinCode:     d.manufacturer?.pinCode,
        mobNumber:   d.manufacturer?.mobNumber,
        GSTIN:       d.manufacturer?.GSTIN,
      },

      items: this.products.map(item => ({
        designNumber: item.designNumber,
        colour:       item.colour,
        colourName:   item.colourName,
        colourImage:  item.colourImage,
        size:         item.size,
        quantity:     item.quantity,
        price:        item.price,
        productType:  item.productType,
        gender:       item.gender,
        clothing:     item.clothing,
        subCategory:  item.subCategory,
        hsnCode:      item.hsnCode,
        hsnGst:       item.hsnGst,
        brandName:    item.brandName,
      })),

      discount:          this.purchaseOrder.discount || 0,
      transportDetails:  transportDetails,
      cpNote:            '',
      shopkeeperNote:    '',
      manufacturerNote:  '',
    };

    this.authService.post('po-cp-to-manufacture/create-single', body).subscribe({
      next: (res: any) => {
        this.submitting = false;
        this.communicationService.customSuccess1('Purchase Order Generated Successfully!');
        this.router.navigate(['/cp/cp-shopk-cart-list']);
      },
      error: (err: any) => {
        this.submitting = false;
        this.communicationService.customError1(err?.error?.message || 'Failed to generate PO');
      }
    });
  }

  // ── Download PDF ──────────────────────────────
  downloadPO(): void {
    const element = document.getElementById('purchase-order');
    if (!element) return;

    html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const pxFullHeight = canvas.height;
      const pxPageHeight = Math.floor(((pageHeight - margin * 2) * canvas.width) / imgWidth);
      let pxPage = 0, pageNum = 1;
      const totalPages = Math.ceil(pxFullHeight / pxPageHeight);

      while (pxPage < pxFullHeight) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width  = canvas.width;
        pageCanvas.height = Math.min(pxPageHeight, pxFullHeight - pxPage);
        const ctx = pageCanvas.getContext('2d');
        if (ctx) ctx.drawImage(canvas, 0, pxPage, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
        if (pageNum > 1) pdf.addPage();
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, (pageCanvas.height * imgWidth) / pageCanvas.width);
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        pxPage += pxPageHeight;
        pageNum++;
      }
      pdf.save(`PO_${this.purchaseOrder.poNumber || 'draft'}.pdf`);
    });
  }

  navigateFun(): void {
    this.location.back();
  }
}
