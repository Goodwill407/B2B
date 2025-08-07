import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import html2canvas from 'html2canvas';
import { Location } from '@angular/common';
import { IndianCurrencyPipe } from 'app/custom.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AmountInWordsPipe } from 'app/amount-in-words.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gen-po-retailer-man',
  standalone: true,
  imports: [CommonModule, FormsModule, AccordionModule, TableModule, IndianCurrencyPipe, AmountInWordsPipe],
  templateUrl: './gen-po-retailer-man.component.html',
  styleUrl: './gen-po-retailer-man.component.scss'
})
export class GenPoRetailerManComponent {
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

  email1: string;
  productby1: string;
  products: any[] = [];
  userProfile: any;
  filteredData: any;
  ProductDiscount: any;
  sizeHeaders: string[] = [];
  priceHeaders: { [size: string]: number } = {};

  totalGrandTotal: number = 0;
  gst: number = 0;
  Totalsub: number = 0;
  dicountprice: number = 0;
  sgst: any
  igst: any
  cgst: any
  isIntraState: any;
  // colspan: number = 12;

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location,
    private amountInWordsPipe: AmountInWordsPipe,
  ) {
    this.email1 = this.route.snapshot.paramMap.get('email') ?? '';
    this.productby1 = this.route.snapshot.paramMap.get('productBy') ?? '';
  }

  ngOnInit(): void {
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts(this.email1, this.productby1);



  }

  getAllProducts(email1: string, productby1: string) {
    const url = `rtl-toMnf-cart/cart-products/po?email=${email1}&productBy=${productby1}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        console.log('📦 Raw Response:', res);


        const productSet = res.products?.[0]?.set || [];
        // this.chunkArray(productSet);

        // ✅ Populate purchaseOrder without processing/merging data
        this.purchaseOrder = {
          supplierName: res.manufacturer.companyName || '',
          supplierDetails: res.manufacturer.fullName || '',
          supplierAddress: `${res.manufacturer.address || ''} ${res.manufacturer.city || ''}  ${res.manufacturer.pinCode || ''} ${res.manufacturer.state || ''}`,
          supplierState: res.manufacturer.state,
          supplierContact: res.manufacturer.mobNumber || '',
          supplierGSTIN: res.manufacturer.GSTIN || '',
          supplierEmail: res.manufacturer.email || '',
          supplierPAN: res.manufacturer.pan || '',
          buyerName: res.retailer.companyName || '',
          buyerDetails: res.retailer.fullName || '',
          buyerEmail: res.retailer.email || '',
          buyerAddress: `${res.retailer.address || ''} ${res.retailer.city || ''}  ${res.retailer.pinCode || ''} ${res.retailer.state || ''}`,
          buyerState: res.retailer.state,
          buyerPhone: res.retailer.mobNumber || '',
          buyerGSTIN: res.retailer.GSTIN || '',
          buyerPAN: res.retailer.pan || '',
          logoUrl: res.retailer.profileImg || 'assets/images/company_logo.jpg',
          orderDate: new Date().toLocaleDateString(),
          poDate: new Date().toLocaleDateString(),
          orderNumber: res.orderNumber || '',
          products: productSet,
          ProductDiscount: res.retailer.productDiscount || 0
        };

        // ✅ Store unprocessed product data
        this.products = productSet;

        // ✅ Extract size/price for footer summary calculations
        this.extractSizesAndPrices(productSet);

        // ✅ Chunk the original data (used only for PDF)

        // this.chunkArray(productSet);
        // or whatever your full data list is

        // ✅ Calculate totals directly
        this.calculateTotalsFromRawData(productSet);

        this.updateStateType();



      },
      (error) => {
        console.error("Error fetching products:", error);
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

    this.calculateGST(); // already uses discountedTotal

    this.totalGrandTotal = this.discountedTotal + this.sgst + this.cgst + this.igst;
  }


  navigateFun() {
    this.location.back();
  }

  extractSizesAndPrices(productSet: any[]): void {
    const uniqueSizes = new Set<string>();
    this.priceHeaders = {}; // Reset size-price mapping

    productSet.forEach((product) => {
      if (product.size && product.price > 0) {
        uniqueSizes.add(product.size);
        this.priceHeaders[product.size] = product.price;
      }
    });

    this.sizeHeaders = Array.from(uniqueSizes); // Convert Set to Array for the table header
  }

  discountedTotal: number = 0; // Add this property

  processGroupedProducts(productSet: any[]): any[] {
    const groupedByDesignNumber: any = {};
    let totalGrandTotal = 0;
    let totalSub = 0;
    let totalDiscounted = 0;

    // Step 1: Group products by design number
    productSet.forEach((product) => {
      const designKey = product.designNumber;

      if (!groupedByDesignNumber[designKey]) {
        groupedByDesignNumber[designKey] = {
          designNumber: product.designNumber,
          rows: [],
          subTotal: 0,
          discountedTotal: 0,
          grandTotal: 0,
        };
      }

      let existingRow = groupedByDesignNumber[designKey].rows.find(
        (row: any) => row.colourName === product.colourName
      );

      if (!existingRow) {
        existingRow = {
          colourName: product.colourName,
          quantities: {},
          totalPrice: 0,
        };
        groupedByDesignNumber[designKey].rows.push(existingRow);
      }

      existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
      existingRow.totalPrice += product.quantity * product.price;
    });

    // Step 2: Calculate totals for all products
    Object.values(groupedByDesignNumber).forEach((group: any) => {
      group.subTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, false), 0);
      group.discountedTotal = group.rows.reduce((acc: number, row: any) => acc + this.calculateTotalPrice(row, true), 0);

      totalSub += group.subTotal;
      totalDiscounted += group.discountedTotal;
    });

    // Step 3: Calculate GST based on the total discounted value (not per product)
    this.discountedTotal = totalDiscounted;  // Use final discounted total for all products
    this.calculateGST();  // Calculate GST based on the final discounted total

    // Step 4: Calculate the Grand Total (without double-counting GST)
    totalGrandTotal = totalDiscounted + this.igst;  // Don't add GST twice

    // Store the final totals
    this.Totalsub = totalSub;
    this.totalGrandTotal = parseFloat(totalGrandTotal.toFixed(2));  // Round to two decimal places

    console.log('Subtotal:', totalSub);
    console.log('Total Discounted:', totalDiscounted);  // This should be the final discounted total
    console.log('GST (SGST, CGST, IGST):', this.sgst, this.cgst, this.igst);
    console.log('Grand Total:', this.totalGrandTotal);

    return Object.values(groupedByDesignNumber);
  }




  calculateTotalPrice(row: any, applyDiscount: boolean = true): number {
    let total = 0;
    this.sizeHeaders.forEach((size) => {
      if (row.quantities[size] > 0) {
        total += row.quantities[size] * (this.priceHeaders[size] || 0);
      }
    });
    if (applyDiscount && this.purchaseOrder.ProductDiscount && this.purchaseOrder.ProductDiscount > 0) {
      const discount = (total * this.purchaseOrder.ProductDiscount) / 100;
      total -= discount;
    }
    return total;
  }




  calculateGST() {
    const discountedTotal = this.discountedTotal;

    // ✅ Use clean state values from response instead of parsing addresses
    const retailerState = this.responseData?.retailer?.state?.trim().toLowerCase();
    const supplierState = this.responseData?.manufacturer?.state?.trim().toLowerCase();

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
      // Fallback: treat as IGST if we can't compare properly
      this.sgst = 0;
      this.cgst = 0;
      this.igst = (discountedTotal * 18) / 100;
    }

    this.totalGrandTotal = parseFloat((discountedTotal + this.sgst + this.cgst + this.igst).toFixed(2));
  }

  updateStateType() {
    const buyerState = this.purchaseOrder.buyerState;
    console.log(buyerState);
    const supplierState = this.purchaseOrder.supplierState || this.purchaseOrder.supplierAddress?.state || '';
    console.log(supplierState);
    this.isIntraState = buyerState && supplierState && (buyerState.trim().toLowerCase() === supplierState.trim().toLowerCase());
    console.log(this.isIntraState);
    // if(this.isIntraState){
    //   this.colspan = 12
    // }else{
    //   this.colspan = 11
    // }
  }

  get colspan(): number {
    return this.isIntraState ? 12 : 11;
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



  calculateDiscountedTotal(subTotal: number): number {
    // Apply discount (for example, 2% in this case)
    const discount = (subTotal * 2) / 100;
    const discountedTotal = subTotal - discount;

    // Store discount for display
    this.dicountprice = this.purchaseOrder.ProductDiscount > 0 ? (this.Totalsub * this.purchaseOrder.ProductDiscount) / 100 : 0;


    return discountedTotal;
  }


  calculateGrandTotal(subTotal: number, discount: number, igst: number): number {
    const discountedSubtotal = subTotal - discount;
    const igstAmount = (discountedSubtotal * igst) / 100;  // Apply 18% IGST
    return discountedSubtotal + igstAmount;
  }


  isSizeAvailable(rows: any[], size: string): boolean {
    return rows.some((row) => row.quantities[size] > 0);
  }

  async addpo() {
    try {
      // Get transporter details first
      const transportDetails = await this.postTransporterDetails();

      if (!transportDetails) {
        // User cancelled the transporter details form
        return;
      }

      const cartData = this.responseData;

      const poBody = {
        statusAll: 'pending',
        email: cartData.retailer.email,
        manufacturerEmail: cartData.manufacturer.email,
        discount: cartData.retailer.productDiscount || 0,
        retailerPoDate: new Date(),
        poNumber: cartData.orderNumber || '',
        cartId: cartData.products?.[0]?._id || '',
        set: cartData.products?.[0]?.set || [],

        // Add transport details to the PO body
        transportDetails: transportDetails,

        manufacturer: {
          email: cartData.manufacturer.email,
          fullName: cartData.manufacturer.fullName,
          companyName: cartData.manufacturer.companyName,
          address: cartData.manufacturer.address,
          state: cartData.manufacturer.state,
          country: cartData.manufacturer.country || 'India',
          pinCode: cartData.manufacturer.pinCode,
          mobNumber: cartData.manufacturer.mobNumber,
          GSTIN: cartData.manufacturer.GSTIN,
        },

        retailer: {
          email: cartData.retailer.email,
          fullName: cartData.retailer.fullName,
          companyName: cartData.retailer.companyName,
          address: cartData.retailer.address,
          state: cartData.retailer.state,
          country: cartData.retailer.country || 'India',
          pinCode: cartData.retailer.pinCode,
          mobNumber: cartData.retailer.mobNumber,
          GSTIN: cartData.retailer.GSTIN,
          logo: cartData.retailer.profileImg || '',
          productDiscount: cartData.retailer.productDiscount || '',
          category: cartData.retailer.category || '',
        }
      };

      this.authService.post('po-retailer-to-manufacture', poBody).subscribe(
        (res: any) => {
          console.log('PO Response:', res);
          this.communicationService.customSuccess('Purchase Order Generated Successfully with Transport Details');
          this.navigateFun();
        },
        (error) => {
          console.error('PO Creation Error:', error);
          this.communicationService.customError1(error.error.message);
        }
      );
    } catch (error) {
      console.error('Error in addpo:', error);
    }
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
      totalQty,
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      totalWithGST
    };
  }

  get totalWithGSTBeforeDiscount(): number {
    return this.orderTotals.totalWithGST || 0;
  }

  get totalGSTAmount(): number {
    const totals = this.orderTotals;
    return totals.totalCGST + totals.totalSGST + totals.totalIGST;
  }


  get discountAmount(): number {
    // Parse discount to number if it comes as string
    const discountPercent = Number(this.purchaseOrder.ProductDiscount) || 0;
    return (this.totalWithGSTBeforeDiscount * discountPercent) / 100;
  }

  get actualGrandTotal(): number {
    return this.totalWithGSTBeforeDiscount - this.discountAmount;
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

      // Convert pixels to mm
      const pxFullHeight = canvas.height;
      const pxPageHeight = Math.floor(((pageHeight - margin * 2) * canvas.width) / imgWidth);
      let pxPage = 0;
      let pageNum = 1;
      const totalPages = Math.ceil(pxFullHeight / pxPageHeight);

      while (pxPage < pxFullHeight) {
        // Create a canvas for the current page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(pxPageHeight, pxFullHeight - pxPage);
        const pageCtx = pageCanvas.getContext('2d');
        // Draw portion of full canvas
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
        // Add page number at footer
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

        pxPage += pxPageHeight;
        pageNum++;
      }
      const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
      const poNumber = this.purchaseOrder.orderNumber || 'no-number';
      pdf.save(`PO_${poDate}_${poNumber}.pdf`);
    });
  }

  async postTransporterDetails(): Promise<any> {
  // Step 1: Choose Transport Type (Self or Third Party)
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
    return null; // User cancelled
  }

  // If self transport, return minimal data
  if (transportType === 'self') {
    return {
      transportType: 'Self',
      modeOfTransport: 'self',
      transporterCompanyName: this.purchaseOrder.buyerName,
      contactNumber: parseInt(this.purchaseOrder.buyerPhone) || 0,
      contactPersonName: this.purchaseOrder.buyerDetails
    };
  }

  // For 3rd Party, show detailed form WITH mode of transport included
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
          <label class="form-label">Tracking ID</label>
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
      // const dispatchDate = (document.getElementById('dispatchDate') as HTMLInputElement).value;
      // const expectedDeliveryDate = (document.getElementById('expectedDeliveryDate') as HTMLInputElement).value;

      // Validation for required fields
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
        // dispatchDate: dispatchDate || undefined,
        // expectedDeliveryDate: expectedDeliveryDate || undefined,
      };
    }
  });

  return formValues || null;
}
        // This HTML code part is from above swal pop up
        // <div class="mb-3">
        //   <label class="form-label">Dispatch Date</label>
        //   <input id="dispatchDate" class="swal2-input" type="date" style="width: 80%;">
        // </div>
        
        // <div class="mb-3">
        //   <label class="form-label">Expected Delivery Date</label>
        //   <input id="expectedDeliveryDate" class="swal2-input" type="date" style="width: 80%;">
        // </div>  

  //   flattenProductData(productSet: any[]): any[] {
  //     const flatList: any[] = [];

  //     // Iterate through each product in the set
  //     productSet.forEach((product) => {
  //         const designKey = product.designNumber; // Assuming each product has a designNumber

  //         // Check if we already have a row for this designNumber + colourName
  //         let existingRow = flatList.find(row => row.designNumber === designKey && row.colourName === product.colourName);

  //         // If no existing row, create a new one
  //         if (!existingRow) {
  //             existingRow = {
  //                 designNumber: product.designNumber,
  //                 colourName: product.colourName,
  //                 colourImage: product.colourImage,
  //                 colour: product.colour,
  //                 quantities: {},
  //                 totalPrice: 0
  //             };
  //             flatList.push(existingRow);
  //         }

  //         // Update quantities for this specific size
  //         if (product.size && product.quantity) {
  //             existingRow.quantities[product.size] = (existingRow.quantities[product.size] || 0) + product.quantity;
  //             existingRow.totalPrice += product.quantity * parseFloat(product.price); // Assuming price is a string
  //         }
  //     });

  //     return flatList;
  // }

  // tableChunks: any[][] = [];
  // serialOffset: number[] = [];

  // chunkArray(array: any[]): void {
  //   this.tableChunks = [];
  //   this.serialOffset = [];

  //   const firstChunkSize = 20;
  //   const nextChunkSize = 30;

  //   if (array.length > 0) {
  //     // Push first 20
  //     this.tableChunks.push(array.slice(0, firstChunkSize));
  //     this.serialOffset.push(0);

  //     let start = firstChunkSize;
  //     while (start < array.length) {
  //       this.tableChunks.push(array.slice(start, start + nextChunkSize));
  //       this.serialOffset.push(start); // Serial starts from this index
  //       start += nextChunkSize;
  //     }
  //   }
  // }


  // printPO(): void {
  //   const fullId = 'purchase-order';
  //   const pdf = new jsPDF('p', 'mm', 'a4');
  //   const pageWidth = pdf.internal.pageSize.getWidth();
  //   const margin = 10;
  //   const chunkCount = this.tableChunks.length;
  //   let currentChunk = 0;

  //   const renderChunk = () => {
  //     const fullContent = document.getElementById(fullId);
  //     if (!fullContent) return;

  //     const fullClone = fullContent.cloneNode(true) as HTMLElement;

  //     // Hide all chunks except current one
  //     const chunks = fullClone.querySelectorAll('.table-chunk');
  //     chunks.forEach((div, i) => {
  //       (div as HTMLElement).style.display = i === currentChunk ? 'block' : 'none';
  //     });

  //     // ✅ REMOVE the full header content after first page
  //     if (currentChunk > 0) {
  //       const headerContent = fullClone.querySelector('.page-header-content');
  //       if (headerContent) headerContent.remove();
  //     }

  //     // ✅ Include styles to maintain design
  //     const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  //     styles.forEach((tag) => {
  //       fullClone.appendChild(tag.cloneNode(true));
  //     });

  //     // ✅ Insert into off-screen DOM for rendering
  //     const tempWrapper = document.createElement('div');
  //     tempWrapper.style.position = 'fixed';
  //     tempWrapper.style.top = '-10000px';
  //     tempWrapper.style.left = '-10000px';
  //     tempWrapper.style.width = '1000px';
  //     tempWrapper.style.zIndex = '-9999';
  //     tempWrapper.style.opacity = '0';
  //     tempWrapper.appendChild(fullClone);
  //     document.body.appendChild(tempWrapper);

  //     html2canvas(fullClone, {
  //       scale: 2,
  //       useCORS: true,
  //       scrollY: -window.scrollY
  //     }).then((canvas) => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const imgProps = pdf.getImageProperties(imgData);
  //       const imgWidth = pageWidth - margin * 2;
  //       const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  //       if (currentChunk > 0) pdf.addPage();
  //       pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

  //       document.body.removeChild(tempWrapper);

  //       currentChunk++;
  //       if (currentChunk < chunkCount) {
  //         renderChunk(); // Go to next table chunk
  //       } else {
  //     const poDate = this.purchaseOrder.poDate?.replace(/\//g, '-') || 'no-date';
  // const poNumber = this.purchaseOrder.poNumber || 'no-number';
  // pdf.save(`PO_${poDate}_${poNumber}.pdf`);
  //       }
  //     });
  //   };

  //   renderChunk();
  // }

}
