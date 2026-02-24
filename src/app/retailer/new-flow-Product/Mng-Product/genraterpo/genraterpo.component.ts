import { CommonModule, Location } from '@angular/common';   
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-genraterpo',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './genraterpo.component.html',
  styleUrl: './genraterpo.component.scss',
})
export class GenraterpoComponent implements OnInit {
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

  responseData: any;
  distributorId: string;
  products: any[] = [];
  userProfile: any;
  ProductDiscount: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  sgst: any;
  igst: any;
  cgst: any;
  isIntraState: any;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe,
  ) {
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.distributorId);
  }

  getAllProducts(distributorId: string) {
    const url = `retailer-cart-type2/place-order/products/${distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        console.log('📦 Raw Response:', res);

        const productSet = res.set || [];

        const discountValue = res.retailer?.productDiscount
          ? parseFloat(res.retailer.productDiscount)
          : 0;

        // ✅ Populate purchaseOrder without processing/merging data
        this.purchaseOrder = {
          supplierName: res.wholesaler?.companyName || '',
          supplierDetails: res.wholesaler?.fullName || '',
          supplierEmail: res.wholesaler?.email || '',
          supplierAddress: `${res.wholesaler?.address || ''} ${res.wholesaler?.city || ''} ${res.wholesaler?.pinCode || ''} ${res.wholesaler?.state || ''}`,
          supplierState: res.wholesaler?.state,
          supplierContact: res.wholesaler?.mobNumber || '',
          supplierGSTIN: res.wholesaler?.GSTIN || '',
          supplierPAN: res.wholesaler?.pan || '',
          buyerName: res.retailer?.companyName || '',
          buyerDetails: res.retailer?.fullName || '',
          buyerEmail: res.retailer?.email || '',
          buyerAddress: `${res.retailer?.address || ''} ${res.retailer?.city || ''} ${res.retailer?.pinCode || ''} ${res.retailer?.state || ''}`,
          buyerState: res.retailer?.state,
          buyerPhone: res.retailer?.mobNumber || '',
          buyerGSTIN: res.retailer?.GSTIN || '',
          buyerPAN: res.retailer?.pan || '',
          logoUrl: res.retailer?.profileImg || 'assets/images/company_logo.jpg',
          poNumber: res.poNumber || '',
          poDate: new Date().toLocaleDateString(),
          products: productSet,
          ProductDiscount: discountValue,
        };

        // ✅ Store unprocessed product data
        this.products = productSet;

        // ✅ Extract size/price for footer summary calculations
        this.extractSizesAndPrices(productSet);

        // ✅ Calculate totals directly
        this.calculateTotalsFromRawData(productSet);

        this.updateStateType();
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  calculateTotalsFromRawData(productSet: any[]) {
    let subtotal = 0;

    productSet.forEach((item) => {
      const quantity = item.quantity || 0;
      const rate = parseFloat(item.price) || 0;
      subtotal += quantity * rate;
    });

    this.Totalsub = subtotal;

    const discount = this.purchaseOrder.ProductDiscount || 0;
    const discountAmount = (subtotal * discount) / 100;
    this.discountedTotal = subtotal - discountAmount;
    this.dicountprice = discountAmount;

    this.calculateGST();

    this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
  }

  navigateFun() {
    this.location.back();
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

  discountedTotal: number = 0;

  getGstAmounts(item: any) {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.price) || 0;
    const gstRate = Number(item.hsnGst) || 0;

    // ✅ Apply discount to rate BEFORE calculating taxable value
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
      originalRate: rate,
      discountedRate: discountedRate,
      taxable: isNaN(taxable) ? 0 : taxable, 
      gstRate: isNaN(gstRate) ? 0 : gstRate, 
      cgst: isNaN(cgst) ? 0 : cgst, 
      sgst: isNaN(sgst) ? 0 : sgst, 
      igst: isNaN(igst) ? 0 : igst, 
      totalWithGst: isNaN(totalWithGst) ? 0 : totalWithGst 
    };
  }

  calculateGST() {
    const discountedTotal = this.discountedTotal;

    const retailerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.wholesaler?.state?.trim().toLowerCase();

    if (retailerState && supplierState) {
      if (retailerState === supplierState) {
        this.sgst = (discountedTotal * 9) / 100;
        this.cgst = (discountedTotal * 9) / 100;
        this.igst = 0;
      } else {
        this.sgst = 0;
        this.cgst = 0;
        this.igst = (discountedTotal * 18) / 100;
      }
    } else {
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (discountedTotal * 18) / 100;
    }

    this.totalGrandTotal = parseFloat((discountedTotal + this.sgst + this.cgst + this.igst).toFixed(2));
  }

  updateStateType() {
    const buyerState = this.purchaseOrder.buyerState;
    const supplierState = this.purchaseOrder.supplierState || '';
    this.isIntraState = buyerState && supplierState && (buyerState.trim().toLowerCase() === supplierState.trim().toLowerCase());
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
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.price) || 0;
      totalWithoutDiscount += quantity * rate;
    }

    return (totalWithoutDiscount * discountPercent) / 100;
  }

  get actualGrandTotal(): number {
    return this.orderTotals.totalWithGST;
  }

  async addpo() {
    try {
      const transportDetails = await this.postTransporterDetails();

      if (!transportDetails) {
        return;
      }

      const cartBody = { ...this.responseData };

      // Inject productBy into every item in set
      if (Array.isArray(cartBody.set)) {
        const productByValue = this.responseData?.productBy || this.userProfile?.email || '';
        cartBody.set = cartBody.set.map((item: any) => ({
          ...item,
          productBy: productByValue,
          status: 'pending'
        }));
      }

      const poBody = {
        statusAll: 'pending',
        email: this.responseData.retailer.email,
        wholesalerEmail: this.responseData.wholesaler.email,
        discount: this.purchaseOrder.ProductDiscount || 0,
        retailerPoDate: new Date(),
        poNumber: this.purchaseOrder.poNumber || '',
        cartId: this.responseData?._id || '',
        set: cartBody.set || [],

        transportDetails: transportDetails,

        wholesaler: {
          email: this.responseData.wholesaler.email,
          fullName: this.responseData.wholesaler.fullName,
          companyName: this.responseData.wholesaler.companyName,
          address: this.responseData.wholesaler.address,
          state: this.responseData.wholesaler.state,
          country: this.responseData.wholesaler.country || 'India',
          pinCode: this.responseData.wholesaler.pinCode,
          mobNumber: this.responseData.wholesaler.mobNumber,
          GSTIN: this.responseData.wholesaler.GSTIN,
        },

        retailer: {
          email: this.responseData.retailer.email,
          fullName: this.responseData.retailer.fullName,
          companyName: this.responseData.retailer.companyName,
          address: this.responseData.retailer.address,
          state: this.responseData.retailer.state,
          country: this.responseData.retailer.country || 'India',
          pinCode: this.responseData.retailer.pinCode,
          mobNumber: this.responseData.retailer.mobNumber,
          GSTIN: this.responseData.retailer.GSTIN,
          logo: this.responseData.retailer.profileImg || '',
          productDiscount: this.purchaseOrder.ProductDiscount || '',
          category: this.responseData.retailer.category || '',
        }
      };

      console.log('📤 Sending Purchase Order:', poBody);

      this.authService.post('po-retailer-to-wholesaler', poBody).subscribe(
        (res: any) => {
          this.communicationService.customSuccess('Purchase Order Generated Successfully with Transport Details');
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

  downloadPO() {
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
          pageCtx.drawImage(
            canvas,
            0, pxPage, canvas.width, pageCanvas.height,
            0, 0, canvas.width, pageCanvas.height
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/png');
        if (pageNum > 1) pdf.addPage();
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, ((pageCanvas.height * imgWidth) / pageCanvas.width));

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

  async postTransporterDetails(): Promise<any> {
    const { value: transportType } = await Swal.fire({
      title: 'Select Transport Type',
      input: 'select',
      inputOptions: {
        'self': 'Self',
        'third': '3rd Party'
      },
      inputPlaceholder: 'Select transport type',
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a transport type!';
        }
        return null;
      }
    });

    if (!transportType) {
      return null;
    }

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
            <label class="form-label"><strong>Mode of Transport *</strong></label>
            <select id="modeOfTransport" class="swal2-input" style="width: 85%;">
              <option value="">Select Mode of Transport</option>
              <option value="road">Road</option>
              <option value="railway">Railway</option>
              <option value="air">Air</option>
              <option value="sea">Sea</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label"><strong>Transporter Company Name *</strong></label>
            <input id="transporterCompanyName" class="swal2-input" placeholder="Enter company name" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label"><strong>Contact Person Name *</strong></label>
            <input id="contactPersonName" class="swal2-input" placeholder="Enter contact person name" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label"><strong>Contact Number *</strong></label>
            <input id="contactNumber" class="swal2-input" type="tel" placeholder="Enter contact number" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label">Alternative Contact Number</label>
            <input id="altContactNumber" class="swal2-input" type="tel" placeholder="Enter alternative contact number" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label">Vehicle Number</label>
            <input id="vehicleNumber" class="swal2-input" placeholder="Enter vehicle number" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label">Tracking ID<br/>(Enter Tracking Number / Consignment No. / AWB / LR / Shipment ID)</label>
            <input id="trackingId" class="swal2-input" placeholder="Enter tracking ID" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label">Delivery Address</label>
            <textarea id="deliveryAddress" class="swal2-textarea" placeholder="Enter delivery address" style="width: 80%; height: 60px;">${this.purchaseOrder.buyerAddress}</textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">GST Number of Transporter</label>
            <input id="gstNumber" class="swal2-input" placeholder="Enter GST number" style="width: 80%;">
          </div>

          <div class="mb-3">
            <label class="form-label">Remarks</label>
            <textarea id="remarks" class="swal2-textarea" placeholder="Enter remarks" style="width: 80%; height: 60px;"></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Add Note</label>
            <textarea id="note" class="swal2-textarea" placeholder="Enter additional notes" style="width: 80%; height: 60px;"></textarea>
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

        if (!modeOfTransport) {
          Swal.showValidationMessage('Mode of Transport is required');
          return false;
        }
        if (!transporterCompanyName) {
          Swal.showValidationMessage('Transporter Company Name is required');
          return false;
        }
        if (!contactPersonName) {
          Swal.showValidationMessage('Contact Person Name is required');
          return false;
        }
        if (!contactNumber) {
          Swal.showValidationMessage('Contact Number is required');
          return false;
        }
        if (!/^\d{10}$/.test(contactNumber)) {
          Swal.showValidationMessage('Contact Number must be 10 digits');
          return false;
        }

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
}