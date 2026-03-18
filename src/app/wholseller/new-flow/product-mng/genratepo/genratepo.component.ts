import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-genratepo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    TableModule,
    IndianCurrencyPipe,
    AmountInWordsPipe
  ],
  templateUrl: './genratepo.component.html',
  styleUrls: ['./genratepo.component.scss'],
})
export class GenratepoComponent implements OnInit {

  purchaseOrder: any = {
    supplierName: '',
    supplierDetails: '',
    supplierAddress: '',
    supplierContact: '',
    supplierGSTIN: '',
    logoUrl: 'assets/images/company_logo.jpg',
    orderDate: new Date().toLocaleDateString(),
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerGSTIN: '',
    products: [],
    totalAmount: 0,
    ProductDiscount: 0,
  };

  responseData: any;
  wholesalerEmail: string;
  manufacturerEmail: string;

  products: any[] = [];
  userProfile: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  discountedTotal: number = 0;

  sgst: number = 0;
  cgst: number = 0;
  igst: number = 0;
  isIntraState: boolean = false;

  tableChunks: any[][] = [];
  serialOffset: number[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe,
  ) {
    this.wholesalerEmail = this.route.snapshot.paramMap.get('wholesalerEmail') ?? '';
    this.manufacturerEmail = this.route.snapshot.paramMap.get('manufacturerEmail') ?? '';
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.wholesalerEmail, this.manufacturerEmail);
  }

  getAllProducts(wholesalerEmail: string, manufacturerEmail: string): void {
    const url = `wholesaler-cart/cart-products/po?wholesalerEmail=${wholesalerEmail}&manufacturerEmail=${manufacturerEmail}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        console.log('✅ Full API response:', res);
        this.responseData = res;

        const productSet = res.products?.[0]?.set || [];

        this.purchaseOrder = {
          // Supplier = Manufacturer
          supplierName: res.manufacturer?.companyName || '',
          supplierDetails: res.manufacturer?.fullName || '',
          supplierAddress: `${res.manufacturer?.address || ''} ${res.manufacturer?.city || ''} ${res.manufacturer?.pinCode || ''} ${res.manufacturer?.state || ''}`,
          supplierState: res.manufacturer?.state || '',
          supplierContact: res.manufacturer?.mobNumber || '',
          supplierGSTIN: res.manufacturer?.GSTIN || '',
          supplierEmail: res.manufacturer?.email || '',
          supplierPAN: res.manufacturer?.pan || '',

          // Buyer = Wholesaler
          buyerName: res.wholesaler?.companyName || '',
          buyerDetails: res.wholesaler?.fullName || '',
          buyerEmail: res.wholesaler?.email || '',
          buyerAddress: `${res.wholesaler?.address || ''} ${res.wholesaler?.city || ''} ${res.wholesaler?.pinCode || ''} ${res.wholesaler?.state || ''}`,
          buyerState: res.wholesaler?.state || '',
          buyerPhone: res.wholesaler?.mobNumber || '',
          buyerGSTIN: res.wholesaler?.GSTIN || '',
          buyerPAN: res.wholesaler?.pan || '',
          logoUrl: res.wholesaler?.profileImg || 'assets/images/company_logo.jpg',

          poDate: new Date().toLocaleDateString(),
          poNumber: res.orderNumber || '',      // ✅ was res.poNumber
          orderNumber: res.orderNumber || '',   // ✅ was res.poNumber
          // orderNumber: res.poNumber || '',

          products: productSet,
          ProductDiscount: res.wholesaler?.productDiscount
            ? parseFloat(res.wholesaler.productDiscount)
            : 0,
        };

        this.products = productSet;
        this.extractSizesAndPrices(productSet);
        this.calculateTotalsFromRawData(productSet);
        this.chunkArray(productSet);
        this.updateStateType();
      },
      (error) => {
        console.error('❌ Error fetching products:', error);
        this.communicationService.customError1('Failed to load purchase order data.');
      }
    );
  }

  calculateTotalsFromRawData(productSet: any[]): void {
    let subtotal = 0;
    productSet.forEach((item) => {
      const quantity = item.quantity || 0;
      const rate = parseFloat(item.price) || 0;
      subtotal += quantity * rate;
    });

    this.Totalsub = subtotal;

    const discount = this.purchaseOrder.ProductDiscount || 0;
    const discountAmount = (subtotal * discount) / 100;
    this.dicountprice = discountAmount;
    this.discountedTotal = subtotal - discountAmount;

    this.calculateGST();
    this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
  }

  extractSizesAndPrices(productSet: any[]): void {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {};
    productSet.forEach((product) => {
      if (product.size && product.price > 0) {
        uniqueSizes.add(product.size);
        this.priceHeaders[product.size] = product.price;
      }
    });
    this.sizeHeaders = Array.from(uniqueSizes);
  }

  calculateGST(): void {
    const dt = this.discountedTotal;
    const manuState = this.responseData?.manufacturer?.state?.trim().toLowerCase();
    const whoState = this.responseData?.wholesaler?.state?.trim().toLowerCase();

    if (manuState && whoState && manuState === whoState) {
      this.sgst = (dt * 9) / 100;
      this.cgst = (dt * 9) / 100;
      this.igst = 0;
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (dt * 18) / 100;
    }

    this.totalGrandTotal = +(dt + this.sgst + this.cgst + this.igst).toFixed(2);
  }

  updateStateType(): void {
    const buyerState = this.purchaseOrder.buyerState?.trim().toLowerCase();
    const supplierState = this.purchaseOrder.supplierState?.trim().toLowerCase();
    this.isIntraState = !!(buyerState && supplierState && buyerState === supplierState);
  }

  get colspan(): number {
    return this.isIntraState ? 15 : 14;
  }

  getGstAmounts(item: any) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    const gstRate = Number(item.hsnGst) || 0;

    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    const discountedRate = rate - (rate * discountPercent / 100);
    const taxable = quantity * discountedRate;

    let cgst = 0, sgst = 0, igst = 0;
    if (this.isIntraState) {
      cgst = (taxable * gstRate / 2) / 100;
      sgst = (taxable * gstRate / 2) / 100;
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
      totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst
    };
  }

  get orderTotals() {
    let totalQty = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalWithGST = 0;

    for (const item of this.products) {
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

  get totalWithGSTBeforeDiscount(): number {
    return this.orderTotals.totalWithGST || 0;
  }

  get totalGSTAmount(): number {
    const totals = this.orderTotals;
    const total = totals.totalCGST + totals.totalSGST + totals.totalIGST;
    return isNaN(total) ? 0 : total;
  }

  get discountAmount(): number {
    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    let totalWithoutDiscount = 0;
    for (const item of this.products) {
      totalWithoutDiscount += (Number(item.quantity) || 0) * (Number(item.price) || 0);
    }
    return (totalWithoutDiscount * discountPercent) / 100;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST;
  }

  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  async addpo(): Promise<void> {
  try {
    const transportDetails = await this.postTransporterDetails();
    if (!transportDetails) return;

    const cartData = this.responseData;

    const poBody = {
      statusAll: 'pending',
      wholesalerEmail: cartData.wholesaler?.email || '',
      manufacturerEmail: cartData.manufacturer?.email || '',
      discount: String(cartData.wholesaler?.productDiscount || '0'),
      wholesalerPODateCreated: new Date(),
      poNumber: cartData.orderNumber || '',
      cartId: cartData.products?.[0]?._id || '',

      // ✅ Send raw set directly like reference, just add model fields
      // set: (cartData.products?.[0]?.set || []).map((item: any) => ({
      //   ...item,                                    // ✅ spread everything as-is
      //   totalQuantity: item.quantity,               // ✅ model field
      //   expectedQty: item.quantity,                 // ✅ model field
      //   colourImage: item.colourImage || '',        // ✅ ensure not null
      //   status: 'pending',
      //   confirmed: false,
      //   rejected: false,
      // })),

      set: cartData.products?.[0]?.set || [],

      transportDetails: transportDetails,

      manufacturer: {
        email: cartData.manufacturer?.email || '',
        fullName: cartData.manufacturer?.fullName || '',
        companyName: cartData.manufacturer?.companyName || '',
        address: cartData.manufacturer?.address || '',
        state: cartData.manufacturer?.state || '',
        country: cartData.manufacturer?.country || 'India',
        pinCode: cartData.manufacturer?.pinCode || '',
        mobNumber: cartData.manufacturer?.mobNumber || '',
        GSTIN: cartData.manufacturer?.GSTIN || '',
        profileImg: cartData.manufacturer?.profileImg || '',
      },

      wholesaler: {
        email: cartData.wholesaler?.email || '',
        fullName: cartData.wholesaler?.fullName || '',
        companyName: cartData.wholesaler?.companyName || '',
        address: cartData.wholesaler?.address || '',
        state: cartData.wholesaler?.state || '',
        country: cartData.wholesaler?.country || 'India',
        pinCode: cartData.wholesaler?.pinCode || '',
        mobNumber: cartData.wholesaler?.mobNumber || '',
        GSTIN: cartData.wholesaler?.GSTIN || '',
        productDiscount: String(cartData.wholesaler?.productDiscount || ''),
        category: cartData.wholesaler?.category || '',
        profileImg: cartData.wholesaler?.profileImg || '',
      }
    };

    this.authService.post('po-wholesaler-to-manufacture', poBody).subscribe(
      (res: any) => {
        this.communicationService.customSuccess('Purchase Order Generated Successfully');
        this.navigateFun();
      },
      (error) => {
        this.communicationService.customError1(error.error.message);
      }
    );

  } catch (error) {
    console.error('Error in addpo:', error);
  }
}


  async postTransporterDetails(): Promise<any> {
    const { value: transportType } = await Swal.fire({
      title: 'Select Transport Type',
      input: 'select',
      inputOptions: { 'self': 'Self', 'third': '3rd Party' },
      inputPlaceholder: 'Select transport type',
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      inputValidator: (value) => !value ? 'Please select a transport type!' : null
    });

    if (!transportType) return null;

    if (transportType === 'self') {
      return {
        transportType: 'Self',
        modeOfTransport: 'self',
        transporterCompanyName: this.purchaseOrder.buyerName,
        contactNumber: parseInt(this.purchaseOrder.buyerPhone) || 0,
        contactPersonName: this.purchaseOrder.buyerDetails
      };
    }

    const { value: formValues } = await Swal.fire({
      title: 'Transporter Details',
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <div class="mb-3">
            <label><strong>Mode of Transport *</strong></label>
            <select id="modeOfTransport" class="swal2-input" style="width: 85%;">
              <option value="">Select Mode</option>
              <option value="road">Road</option>
              <option value="railway">Railway</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label><strong>Transporter Company Name *</strong></label>
            <input id="transporterCompanyName" class="swal2-input" placeholder="Company name" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label><strong>Contact Person Name *</strong></label>
            <input id="contactPersonName" class="swal2-input" placeholder="Contact person" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label><strong>Contact Number *</strong></label>
            <input id="contactNumber" class="swal2-input" type="tel" placeholder="10-digit number" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label>Alternative Contact Number</label>
            <input id="altContactNumber" class="swal2-input" type="tel" placeholder="Alt contact number" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label>Vehicle Number</label>
            <input id="vehicleNumber" class="swal2-input" placeholder="Vehicle number" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label>Tracking ID</label>
            <input id="trackingId" class="swal2-input" placeholder="Tracking / AWB / LR No." style="width: 80%;">
          </div>
          <div class="mb-3">
            <label>Delivery Address</label>
            <textarea id="deliveryAddress" class="swal2-textarea" style="width: 80%; height: 60px;">${this.purchaseOrder.buyerAddress}</textarea>
          </div>
          <div class="mb-3">
            <label>GST Number of Transporter</label>
            <input id="gstNumber" class="swal2-input" placeholder="GST number" style="width: 80%;">
          </div>
          <div class="mb-3">
            <label>Remarks</label>
            <textarea id="remarks" class="swal2-textarea" placeholder="Remarks" style="width: 80%; height: 60px;"></textarea>
          </div>
          <div class="mb-3">
            <label>Note</label>
            <textarea id="note" class="swal2-textarea" placeholder="Additional notes" style="width: 80%; height: 60px;"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      width: '600px',
      allowOutsideClick: false,
      preConfirm: () => {
        const modeOfTransport = (document.getElementById('modeOfTransport') as HTMLSelectElement).value;
        const transporterCompanyName = (document.getElementById('transporterCompanyName') as HTMLInputElement).value;
        const contactPersonName = (document.getElementById('contactPersonName') as HTMLInputElement).value;
        const contactNumber = (document.getElementById('contactNumber') as HTMLInputElement).value;
        const altContactNumber = (document.getElementById('altContactNumber') as HTMLInputElement).value;
        const vehicleNumber = (document.getElementById('vehicleNumber') as HTMLInputElement).value;
        const trackingId = (document.getElementById('trackingId') as HTMLInputElement).value;
        const deliveryAddress = (document.getElementById('deliveryAddress') as HTMLTextAreaElement).value;
        const gstNumber = (document.getElementById('gstNumber') as HTMLInputElement).value;
        const remarks = (document.getElementById('remarks') as HTMLTextAreaElement).value;
        const note = (document.getElementById('note') as HTMLTextAreaElement).value;

        if (!modeOfTransport) { Swal.showValidationMessage('Mode of Transport is required'); return false; }
        if (!transporterCompanyName) { Swal.showValidationMessage('Transporter Company Name is required'); return false; }
        if (!contactPersonName) { Swal.showValidationMessage('Contact Person Name is required'); return false; }
        if (!contactNumber) { Swal.showValidationMessage('Contact Number is required'); return false; }
        if (!/^\d{10}$/.test(contactNumber)) { Swal.showValidationMessage('Contact Number must be 10 digits'); return false; }

        return {
          transportType: '3rd Party',
          modeOfTransport,
          transporterCompanyName,
          contactPersonName,
          contactNumber: parseInt(contactNumber),
          altContactNumber: altContactNumber ? parseInt(altContactNumber) : undefined,
          vehicleNumber: vehicleNumber || undefined,
          trackingId: trackingId || undefined,
          deliveryAddress: deliveryAddress || undefined,
          gstNumber: gstNumber || undefined,
          remarks: remarks || undefined,
          note: note || undefined,
        };
      }
    });

    return formValues || null;
  }

  navigateFun(): void {
    this.location.back();
  }

  chunkArray(array: any[]): void {
    this.tableChunks = [];
    this.serialOffset = [];
    const firstPage = 20;
    const restPages = 30;

    if (array.length <= firstPage) {
      this.tableChunks.push(array);
      this.serialOffset.push(0);
    } else {
      this.tableChunks.push(array.slice(0, firstPage));
      this.serialOffset.push(0);
      let start = firstPage;
      while (start < array.length) {
        this.tableChunks.push(array.slice(start, start + restPages));
        this.serialOffset.push(start);
        start += restPages;
      }
    }
  }

  downloadPO(): void {
    const element = document.getElementById('purchase-order');
    if (!element) return;

    html2canvas(element, { scale: 2, useCORS: true }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;

      const pxFullHeight = canvas.height;
      const pxPageHeight = Math.floor(((pageHeight - margin * 2) * canvas.width) / imgWidth);
      let pxPage = 0;
      let pageNum = 1;
      const totalPages = Math.ceil(pxFullHeight / pxPageHeight);

      while (pxPage < pxFullHeight) {
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pxPageHeight, pxFullHeight - pxPage);
        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, pxPage, canvas.width, pageCanvas.height,
            0, 0, canvas.width, pageCanvas.height);
        }
        const pageImgData = pageCanvas.toDataURL('image/png');
        if (pageNum > 1) pdf.addPage();
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth,
          (pageCanvas.height * imgWidth) / pageCanvas.width);
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
        pxPage += pxPageHeight;
        pageNum++;
      }

      const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
      const poNumber = this.purchaseOrder.poNumber || 'no-number';
      pdf.save(`PO_${poDate}_${poNumber}.pdf`);
    });
  }
}
