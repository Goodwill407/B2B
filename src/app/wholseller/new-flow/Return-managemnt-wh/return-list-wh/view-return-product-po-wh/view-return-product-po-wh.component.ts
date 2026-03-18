import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Manufacturer {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
  logo?: string;
}

interface Wholesaler {
  email: string;
  fullName: string;
  companyName: string;
  address: string;
  state: string;
  country: string;
  pinCode: string;
  mobNumber: string;
  GSTIN: string;
  logo?: string;
  productDiscount?: string;
  category?: string;
}

interface DeliveryItem {
  status: string;
  _id: string;
  designNumber: string;
  colour?: string;
  colourName: string;
  colourImage: string;
  size: string;
  quantity: number;
  returnQuantity?: number;
  price?: number;
  rate?: number;
  productType: string;
  gender: string;
  clothing: string;
  subCategory: string;
  hsnDescription: string;
  hsnCode?: string;
  hsnGst?: number;
  brandName?: string;
  selectedReturnQuantity?: number;
  returnReason?: string;
  customReason?: string;
}

interface OrderData {
  manufacturer: Manufacturer;
  wholesaler: Wholesaler;
  statusAll: string;
  poId: string;
  poNumber: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceRecievedDate?: string;
  deliveryItems: DeliveryItem[];
  totalQuantity: number;
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  transportDetails?: any;
  bankDetails?: any;
  returnRequestGenerated?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-view-return-product-po-wh',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, RouterModule],
  templateUrl: './view-return-product-po-wh.component.html',
  styleUrl: './view-return-product-po-wh.component.scss'
})
export class ViewReturnProductPoWhComponent implements OnInit {

  static readonly RETURN_PERIOD_DAYS = 15;

  orderData: OrderData | null = null;
  responseData: any;
  orderId: string;
  loading: boolean = true;
  returnedItems: DeliveryItem[] = [];

  isWholesaler: boolean = false;
  currentUserRole: string = '';

  returnRequestGenerated: string = 'false';
  isReturnPeriodValid: boolean = false;
  remainingReturnDays: number = 0;

  returnReasons = [
    'Defective Product',
    'Wrong Size',
    'Wrong Color',
    'Quality Issues',
    'Damaged in Transit',
    'Not as Described',
    'Change of Mind',
    'Other'
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private communicationService: CommunicationService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.orderId = this.route.snapshot.paramMap.get('id') ?? '';
  }

  ngOnInit(): void {
    this.currentUserRole = this.authService.currentUserValue?.role || '';
    this.isWholesaler = this.currentUserRole === 'wholesaler';

    if (this.orderId) {
      this.getOrderDetails();
    } else {
      this.communicationService.customError1('Order ID not found');
      this.loading = false;
    }
  }

  get RETURN_PERIOD_DAYS(): number {
    return ViewReturnProductPoWhComponent.RETURN_PERIOD_DAYS;
  }

  // ─── API ──────────────────────────────────────────────────────────────────

  getOrderDetails(): void {
    this.loading = true;
    this.authService.get(`pi-manufacture-to-wholesaler/${this.orderId}`).subscribe(
      (res: any) => {
        this.responseData = res;
        this.mapOrderData(res);
        this.validateReturnPeriod();
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching order details:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to load order details');
      }
    );
  }

  // ─── Mapping ──────────────────────────────────────────────────────────────

  mapOrderData(data: any): void {
    this.orderData = {
      manufacturer: {
        email: data.manufacturerEmail || data.manufacturer?.email || '',
        fullName: data.manufacturer?.fullName || '',
        companyName: data.manufacturer?.companyName || '',
        address: data.manufacturer?.address || '',
        state: data.manufacturer?.state || '',
        country: data.manufacturer?.country || '',
        pinCode: data.manufacturer?.pinCode || '',
        mobNumber: data.manufacturer?.mobNumber || '',
        GSTIN: data.manufacturer?.GSTIN || '',
        logo: data.manufacturer?.logo || ''
      },
      wholesaler: {
        email: data.wholesalerEmail || data.wholesaler?.email || '',
        fullName: data.wholesaler?.fullName || '',
        companyName: data.wholesaler?.companyName || '',
        address: data.wholesaler?.address || '',
        state: data.wholesaler?.state || '',
        country: data.wholesaler?.country || '',
        pinCode: data.wholesaler?.pinCode || '',
        mobNumber: data.wholesaler?.mobNumber || '',
        GSTIN: data.wholesaler?.GSTIN || '',
        logo: data.wholesaler?.logo || '',
        productDiscount: data.wholesaler?.productDiscount || '',
        category: data.wholesaler?.category || ''
      },
      statusAll: data.statusAll || '',
      poId: data.poId || '',
      poNumber: data.poNumber || 0,
      invoiceNumber: data.invoiceNumber || '',
      invoiceDate: data.invoiceDate || '',
      invoiceRecievedDate: data.invoiceRecievedDate,
      deliveryItems: (data.deliveryItems || []).map((item: any) => ({ ...item })),
      totalQuantity: data.totalQuantity || 0,
      totalAmount: data.totalAmount || 0,
      discountApplied: data.discountApplied || 0,
      finalAmount: data.finalAmount || 0,
      transportDetails: data.transportDetails,
      bankDetails: data.bankDetails,
      returnRequestGenerated: data.returnRequestGenerated || 'false'
    };

    this.returnRequestGenerated = data.returnRequestGenerated || 'false';

    if (this.returnRequestGenerated === 'true') {
      setTimeout(() => {
        Swal.fire({
          title: 'Return Request Already Generated',
          text: 'A return request has already been submitted for this order.',
          icon: 'info',
          confirmButtonColor: '#007bff',
          confirmButtonText: 'OK'
        });
      }, 500);
    }
  }

  // ─── Return Period Validation ─────────────────────────────────────────────

  validateReturnPeriod(): void {
    if (!this.orderData?.invoiceRecievedDate) {
      this.isReturnPeriodValid = false;
      this.remainingReturnDays = 0;
      return;
    }

    const invoiceReceivedDate = new Date(this.orderData.invoiceRecievedDate);
    const currentDate = new Date();

    invoiceReceivedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor(
      (currentDate.getTime() - invoiceReceivedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    this.remainingReturnDays = ViewReturnProductPoWhComponent.RETURN_PERIOD_DAYS - daysDifference;
    this.isReturnPeriodValid = daysDifference < ViewReturnProductPoWhComponent.RETURN_PERIOD_DAYS;

    if (!this.isReturnPeriodValid) {
      setTimeout(() => {
        Swal.fire({
          title: 'Return Period Expired',
          html: `The return period of ${ViewReturnProductPoWhComponent.RETURN_PERIOD_DAYS} days has expired.<br>
                 <small>Invoice received on: ${invoiceReceivedDate.toLocaleDateString('en-IN')}</small>`,
          icon: 'warning',
          confirmButtonColor: '#ffc107',
          confirmButtonText: 'OK'
        });
      }, 800);
    }
  }

  isReturnAllowed(): boolean {
    return this.returnRequestGenerated !== 'true' && this.isReturnPeriodValid;
  }

  // ─── Calculations ─────────────────────────────────────────────────────────

  getItemRate(item: DeliveryItem): number {
    return item.rate || item.price || 0;
  }

  getAvailableReturnQuantity(item: DeliveryItem): number {
    return item.quantity - (item.returnQuantity || 0);
  }

  getTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * item.quantity;
  }

  getTotalWithGST(item: DeliveryItem): number {
    return this.getTaxableValue(item) * (1 + (item.hsnGst || 0) / 100);
  }

  getItemDiscount(item: DeliveryItem): number {
    const totalAmount = this.orderData?.totalAmount || 0;
    if (totalAmount === 0) return 0;
    return this.getTaxableValue(item) * ((this.orderData?.discountApplied || 0) / totalAmount);
  }

  getItemFinalAmount(item: DeliveryItem): number {
    return this.getTotalWithGST(item) - this.getItemDiscount(item);
  }

  getReturnTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * (item.selectedReturnQuantity || 0);
  }

  getReturnTotalWithGST(item: DeliveryItem): number {
    return this.getReturnTaxableValue(item) * (1 + (item.hsnGst || 0) / 100);
  }

  getTotalTaxableValue(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTaxableValue(item), 0) || 0;
  }

  getTotalWithAllGST(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTotalWithGST(item), 0) || 0;
  }

  getTotalFinalAmount(): number {
    return this.getTotalWithAllGST() - (this.orderData?.discountApplied || 0);
  }

  getTotalReturnQuantity(): number {
    return this.returnedItems.reduce((sum, item) => sum + (item.selectedReturnQuantity || 0), 0);
  }

  getTotalReturnTaxableValue(): number {
    return this.returnedItems.reduce((sum, item) => sum + this.getReturnTaxableValue(item), 0);
  }

  getTotalReturnWithGST(): number {
    return this.returnedItems.reduce((sum, item) => sum + this.getReturnTotalWithGST(item), 0);
  }

  getReturnDiscount(): number {
    const totalAmount = this.orderData?.totalAmount || 0;
    if (totalAmount === 0) return 0;
    return this.getTotalReturnTaxableValue() * ((this.orderData?.discountApplied || 0) / totalAmount);
  }

  getFinalReturnAmount(): number {
    return this.getTotalReturnWithGST() - this.getReturnDiscount();
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigateFun(): void {
    this.location.back();
  }

  async onAddToReturn(item: DeliveryItem): Promise<void> {
    if (this.returnRequestGenerated === 'true') {
      Swal.fire({
        title: 'Return Request Already Generated',
        text: 'A return request has already been submitted for this order.',
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.isReturnPeriodValid) {
      Swal.fire({
        title: 'Return Period Expired',
        html: `The return period of ${ViewReturnProductPoWhComponent.RETURN_PERIOD_DAYS} days has expired.`,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.returnedItems.find(r => r._id === item._id)) {
      this.communicationService.customError1('This item is already added for return');
      return;
    }

    const availableReturnQty = this.getAvailableReturnQuantity(item);

    if (availableReturnQty === 0) {
      Swal.fire({
        title: 'Cannot Return Item',
        text: 'All items have already been returned for this product.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return;
    }

    const imageDisplay = item.colourImage && item.colourImage !== ''
      ? `<img src="${item.colourImage}" alt="${item.colourName}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:2px solid #ddd;">`
      : `<div style="width:80px;height:80px;background-color:${item.colour || '#e0e0e0'};border-radius:8px;border:2px solid #ddd;display:inline-block;"></div>`;

    const { value: formValues } = await Swal.fire({
      title: 'Add Item for Return',
      html: `
        <div>
          ${imageDisplay}
          <div class="mt-2">
            <strong>${item.designNumber}</strong><br>
            <small>${item.gender} ${item.clothing || item.subCategory} - ${item.colourName} - ${item.size}</small><br>
            <small>Ordered Qty: ${item.quantity} | Already Returned: ${item.returnQuantity || 0}</small><br>
            <small class="text-primary"><strong>Available: ${availableReturnQty}</strong></small>
          </div>
          <div class="mt-3 text-start">
            <label class="form-label">Return Quantity:</label>
            <input type="number" id="swal-quantity" class="swal2-input" min="1" max="${availableReturnQty}" value="1" style="margin:0;">
          </div>
          <div class="mt-2 text-start">
            <label class="form-label">Return Reason:</label>
            <select id="swal-reason" class="swal2-select" style="margin:0;">
              ${this.returnReasons.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
          <div class="mt-2 text-start" id="custom-reason-group" style="display:none;">
            <label class="form-label">Please specify:</label>
            <textarea id="swal-custom-reason" class="swal2-textarea" placeholder="Enter custom reason..." style="margin:0;"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add to Return',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      didOpen: () => {
        const reasonSelect = document.getElementById('swal-reason') as HTMLSelectElement;
        const customGroup = document.getElementById('custom-reason-group') as HTMLDivElement;
        reasonSelect.addEventListener('change', () => {
          customGroup.style.display = reasonSelect.value === 'Other' ? 'block' : 'none';
        });
      },
      preConfirm: () => {
        const qty = parseInt((document.getElementById('swal-quantity') as HTMLInputElement).value);
        const reason = (document.getElementById('swal-reason') as HTMLSelectElement).value;
        const customReason = (document.getElementById('swal-custom-reason') as HTMLTextAreaElement).value;

        if (!qty || qty <= 0) { Swal.showValidationMessage('Enter a valid quantity'); return false; }
        if (qty > availableReturnQty) { Swal.showValidationMessage(`Max allowed: ${availableReturnQty}`); return false; }
        if (reason === 'Other' && !customReason.trim()) { Swal.showValidationMessage('Please specify the reason'); return false; }

        return { quantity: qty, reason, customReason: reason === 'Other' ? customReason.trim() : '' };
      }
    });

    if (formValues) {
      this.returnedItems.push({
        ...item,
        selectedReturnQuantity: formValues.quantity,
        returnReason: formValues.reason,
        customReason: formValues.customReason
      });
      this.communicationService.customSuccess(`${formValues.quantity} units of ${item.designNumber} added for return`);
    }
  }

  removeFromReturn(item: DeliveryItem): void {
    const index = this.returnedItems.findIndex(r => r._id === item._id);
    if (index > -1) {
      this.returnedItems.splice(index, 1);
      this.communicationService.customSuccess('Item removed from return list');
    }
  }

  processReturns(): void {
    if (this.returnedItems.length === 0) {
      this.communicationService.customError1('No items selected for return');
      return;
    }

    const discountAmount = this.getReturnDiscount();

    Swal.fire({
      title: 'Confirm Return Request',
      html: `
        <p>Items: <strong>${this.returnedItems.length}</strong></p>
        <p>Total return quantity: <strong>${this.getTotalReturnQuantity()}</strong></p>
        <p>Taxable amount: <strong>₹${this.getTotalReturnTaxableValue().toFixed(2)}</strong></p>
        <p>Total with GST: <strong>₹${this.getTotalReturnWithGST().toFixed(2)}</strong></p>
        ${discountAmount > 0 ? `<p>Discount: <strong>₹${discountAmount.toFixed(2)}</strong></p>` : ''}
        <p class="text-success"><strong>Final return amount: ₹${this.getFinalReturnAmount().toFixed(2)}</strong></p>
        <p class="text-muted"><small>This action cannot be undone.</small></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Return Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745'
    }).then(result => {
      if (result.isConfirmed) this.submitReturnRequest();
    });
  }

  private submitReturnRequest(): void {
    this.loading = true;

    const returnData = {
      poId: this.orderData?.poId,
      poNumber: this.orderData?.poNumber,
      invoiceNumber: this.orderData?.invoiceNumber,
      invoiceId: this.responseData?.id,
      invoiceDate: this.orderData?.invoiceDate,
      manufacturerEmail: this.orderData?.manufacturer.email,
      wholesalerEmail: this.orderData?.wholesaler.email,

      deliveryItems: this.returnedItems.map(item => ({
        designNumber: item.designNumber,
        colour: item.colour,
        colourName: item.colourName,
        colourImage: item.colourImage,
        size: item.size,
        orderQuantity: item.quantity,
        returnQuantity: item.selectedReturnQuantity,
        productType: item.productType,
        gender: item.gender,
        clothing: item.clothing,
        subCategory: item.subCategory,
        hsnCode: item.hsnCode || '',
        hsnGst: item.hsnGst || 0,
        rate: this.getItemRate(item),
        hsnDescription: item.hsnDescription || '',
        brandName: item.brandName || '',
        returnReason: item.returnReason,
        otherReturnReason: item.customReason || '',
        manufacturerComments: '',
        returnStatus: 'requested'
      })),

      manufacturer: this.orderData?.manufacturer,
      wholesaler: this.orderData?.wholesaler,
      totalQuantity: this.getTotalReturnQuantity(),
      transportDetails: this.orderData?.transportDetails,
      bankDetails: this.orderData?.bankDetails,
      totalAmount: this.getTotalReturnTaxableValue(),
      discountApplied: this.getReturnDiscount(),
      finalAmount: this.getFinalReturnAmount()
    };

    this.authService.post('return-w2m', returnData).subscribe(
      () => {
        this.loading = false;
        this.updateReturnQuantities().then(() => {
          Swal.fire({
            title: 'Success!',
            text: 'Return request submitted successfully',
            icon: 'success',
            confirmButtonColor: '#28a745'
          }).then(() => {
            this.returnedItems = [];
            this.getOrderDetails();
          });
        }).catch(() => {
          Swal.fire({
            title: 'Success!',
            text: 'Return request submitted successfully',
            icon: 'success',
            confirmButtonColor: '#28a745'
          }).then(() => {
            this.returnedItems = [];
            this.getOrderDetails();
          });
        });
      },
      (error) => {
        console.error('Error submitting return request:', error);
        this.loading = false;
        this.communicationService.customError1('Failed to submit return request');
      }
    );
  }

  private updateReturnQuantities(): Promise<any> {
    return new Promise((resolve, reject) => {
      const updatedDeliveryItems = this.orderData?.deliveryItems.map(item => {
        const returnedItem = this.returnedItems.find(r => r._id === item._id);
        if (returnedItem) {
          return {
            ...item,
            returnQuantity: (item.returnQuantity || 0) + (returnedItem.selectedReturnQuantity || 0)
          };
        }
        return item;
      });

      const updateData = {
        ...this.responseData,
        deliveryItems: updatedDeliveryItems
      };

      this.authService.patchpimage(`pi-manufacture-to-wholesaler/${this.orderId}`, updateData).subscribe(
        (res: any) => resolve(res),
        (error: any) => reject(error)
      );
    });
  }
}
