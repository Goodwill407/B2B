import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

// Interfaces
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
}

interface Retailer {
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
  productType: string;
  gender: string;
  clothing: string;
  subCategory: string;
  hsnDescription: string;
  hsnCode?: string;
  hsnGst?: number;
  brandName?: string;
  rate?: number;
  price?: number;
  selectedReturnQuantity?: number;
  returnReason?: string;
  customReason?: string;
}

interface OrderData {
  manufacturer: Manufacturer;
  retailer: Retailer;
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

@Component({
  selector: 'app-add-return-product-mfg',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, RouterModule],
  templateUrl: './add-return-product-mfg.component.html',
  styleUrl: './add-return-product-mfg.component.scss'
})
export class AddReturnProductMfgComponent implements OnInit {

  static readonly RETURN_PERIOD_DAYS = 15;

  orderData: OrderData | null = null;
  responseData: any;
  orderId: string;
  loading: boolean = true;
  returnedItems: DeliveryItem[] = [];
  
  isRetailer: boolean = false;
  currentUserRole: string = '';

  returnRequestGenerated: string = "false";
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
    this.isRetailer = this.currentUserRole === 'retailer';
    
    if (this.orderId) {
      this.getOrderDetails();
    } else {
      this.communicationService.customError1('Order ID not found');
      this.loading = false;
    }
  }

  get RETURN_PERIOD_DAYS(): number {
    return AddReturnProductMfgComponent.RETURN_PERIOD_DAYS;
  }

  getOrderDetails() {
    this.loading = true;
    
    const url = `pi-manufacture-to-retailer/${this.orderId}`;
    
    this.authService.get(url).subscribe(
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

  mapOrderData(data: any) {
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
        GSTIN: data.manufacturer?.GSTIN || ''
      },
      retailer: {
        email: data.retailerEmail || data.retailer?.email || '',
        fullName: data.retailer?.fullName || '',
        companyName: data.retailer?.companyName || '',
        address: data.retailer?.address || '',
        state: data.retailer?.state || '',
        country: data.retailer?.country || '',
        pinCode: data.retailer?.pinCode || '',
        mobNumber: data.retailer?.mobNumber || '',
        GSTIN: data.retailer?.GSTIN || '',
        logo: data.retailer?.logo || '',
        productDiscount: data.retailer?.productDiscount || '',
        category: data.retailer?.category || ''
      },
      statusAll: data.statusAll || '',
      poId: data.poId || '',
      poNumber: data.poNumber || 0,
      invoiceNumber: data.invoiceNumber || '',
      invoiceDate: data.invoiceDate || '',
      invoiceRecievedDate: data.invoiceRecievedDate,
      deliveryItems: (data.deliveryItems || []).map((item: any) => ({
        ...item
      })),
      totalQuantity: data.totalQuantity || 0,
      totalAmount: data.totalAmount || 0,
      discountApplied: data.discountApplied || 0,
      finalAmount: data.finalAmount || 0,
      transportDetails: data.transportDetails,
      bankDetails: data.bankDetails,
      returnRequestGenerated: data.returnRequestGenerated || "false"
    };

    this.returnRequestGenerated = data.returnRequestGenerated || "false";
  
    if (this.returnRequestGenerated === "true") {
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
    
    const timeDifference = currentDate.getTime() - invoiceReceivedDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    
    this.remainingReturnDays = AddReturnProductMfgComponent.RETURN_PERIOD_DAYS - daysDifference;
    this.isReturnPeriodValid = daysDifference < AddReturnProductMfgComponent.RETURN_PERIOD_DAYS;

    console.log('Return Period Validation:', {
      invoiceReceivedDate: invoiceReceivedDate.toLocaleDateString(),
      currentDate: currentDate.toLocaleDateString(),
      daysDifference,
      remainingDays: this.remainingReturnDays,
      isValid: this.isReturnPeriodValid
    });

    if (!this.isReturnPeriodValid) {
      setTimeout(() => {
        Swal.fire({
          title: 'Return Period Expired',
          html: `The return period of ${AddReturnProductMfgComponent.RETURN_PERIOD_DAYS} days has expired for this order.<br><small>Invoice received on: ${invoiceReceivedDate.toLocaleDateString('en-IN')}</small>`,
          icon: 'warning',
          confirmButtonColor: '#ffc107',
          confirmButtonText: 'OK'
        });
      }, 800);
    }
  }

  isReturnAllowed(): boolean {
    return this.returnRequestGenerated !== "true" && this.isReturnPeriodValid;
  }

  navigateFun() {
    this.location.back();
  }

  getAvailableReturnQuantity(item: DeliveryItem): number {
    return item.quantity - (item.returnQuantity || 0);
  }

  getItemRate(item: DeliveryItem): number {
  // ✅ Use 'price' field which exists in backend response
  return item.rate || item.price || 0;
}

  getTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * item.quantity;
  }

  getTotalWithGST(item: DeliveryItem): number {
    const taxableValue = this.getTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  getItemDiscount(item: DeliveryItem): number {
    const totalAmount = this.orderData?.totalAmount || 0;
    const discountApplied = this.orderData?.discountApplied || 0;
    
    if (totalAmount === 0) return 0;
    
    const discountRate = discountApplied / totalAmount;
    return this.getTaxableValue(item) * discountRate;
  }

  getItemFinalAmount(item: DeliveryItem): number {
    return this.getTotalWithGST(item) - this.getItemDiscount(item);
  }

  getReturnTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * (item.selectedReturnQuantity || 0);
  }

  getReturnTotalWithGST(item: DeliveryItem): number {
    const taxableValue = this.getReturnTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  getTotalTaxableValue(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTaxableValue(item), 0) || 0;
  }

  getTotalWithAllGST(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTotalWithGST(item), 0) || 0;
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
    const discountApplied = this.orderData?.discountApplied || 0;
    
    if (totalAmount === 0) return 0;
    
    const discountRate = discountApplied / totalAmount;
    return this.getTotalReturnTaxableValue() * discountRate;
  }

  getFinalReturnAmount(): number {
    return this.getTotalReturnWithGST() - this.getReturnDiscount();
  }

  getTotalFinalAmount(): number {
    const totalWithGST = this.getTotalWithAllGST();
    const totalDiscount = this.orderData?.discountApplied || 0;
    return totalWithGST - totalDiscount;
  }

  async onAddToReturn(item: DeliveryItem) {
    if (this.returnRequestGenerated === "true") {
      Swal.fire({
        title: 'Return Request Already Generated',
        text: 'A return request has already been submitted for this order. No further returns can be added.',
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (!this.isReturnPeriodValid) {
      Swal.fire({
        title: 'Return Period Expired',
        html: `The return period of ${AddReturnProductMfgComponent.RETURN_PERIOD_DAYS} days has expired for this order.<br><small>You cannot add items for return.</small>`,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'OK'
      });
      return;
    }

    const existingReturnItem = this.returnedItems.find(returnItem => returnItem._id === item._id);
    if (existingReturnItem) {
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

    const { value: formValues } = await Swal.fire({
      title: 'Add Item for Return',
      html: `
        <div class="swal-product-details">
          <div class="product-info mb-3">
            <img src="${item.colourImage}" alt="${item.colourName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;">
            <div class="product-text mt-2">
              <strong>${item.designNumber}</strong><br>
              <small>${item.gender} ${item.clothing || item.subCategory} - ${item.colourName} - ${item.size}</small><br>
              <small>Ordered Quantity: ${item.quantity}</small><br>
              <small>Already Returned: ${item.returnQuantity || 0}</small><br>
              <small class="text-primary"><strong>Available for Return: ${availableReturnQty}</strong></small>
            </div>
          </div>
          
          <div class="form-group mb-3">
            <label for="swal-quantity" class="form-label">Return Quantity:</label>
            <input type="number" id="swal-quantity" class="swal2-input" placeholder="Enter quantity" 
                   min="1" max="${availableReturnQty}" value="1" style="margin: 0;">
          </div>
          
          <div class="form-group mb-3">
            <label for="swal-reason" class="form-label">Return Reason:</label>
            <select id="swal-reason" class="swal2-select" style="margin: 0;">
              ${this.returnReasons.map(reason => `<option value="${reason}">${reason}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" id="custom-reason-group" style="display: none;">
            <label for="swal-custom-reason" class="form-label">Please specify:</label>
            <textarea id="swal-custom-reason" class="swal2-textarea" placeholder="Enter custom reason..." style="margin: 0;"></textarea>
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
        const customReasonGroup = document.getElementById('custom-reason-group') as HTMLDivElement;
        
        reasonSelect.addEventListener('change', () => {
          if (reasonSelect.value === 'Other') {
            customReasonGroup.style.display = 'block';
          } else {
            customReasonGroup.style.display = 'none';
          }
        });
      },
      preConfirm: () => {
        const quantity = (document.getElementById('swal-quantity') as HTMLInputElement).value;
        const reason = (document.getElementById('swal-reason') as HTMLSelectElement).value;
        const customReason = (document.getElementById('swal-custom-reason') as HTMLTextAreaElement).value;

        if (!quantity || parseInt(quantity) <= 0) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return false;
        }

        if (parseInt(quantity) > availableReturnQty) {
          Swal.showValidationMessage(`Quantity cannot exceed available quantity (${availableReturnQty})`);
          return false;
        }

        if (reason === 'Other' && (!customReason || customReason.trim() === '')) {
          Swal.showValidationMessage('Please specify the custom reason');
          return false;
        }

        return {
          quantity: parseInt(quantity),
          reason: reason,
          customReason: reason === 'Other' ? customReason.trim() : ''
        };
      }
    });

    if (formValues) {
      const returnItem: DeliveryItem = {
        ...item,
        selectedReturnQuantity: formValues.quantity,
        returnReason: formValues.reason,
        customReason: formValues.customReason
      };

      this.returnedItems.push(returnItem);
      this.communicationService.customSuccess(`${formValues.quantity} units of ${item.designNumber} added for return`);
    }
  }

  removeFromReturn(item: DeliveryItem) {
    const index = this.returnedItems.findIndex(returnItem => returnItem._id === item._id);
    if (index > -1) {
      this.returnedItems.splice(index, 1);
      this.communicationService.customSuccess('Item removed from return list');
    }
  }

  processReturns() {
    if (this.returnedItems.length === 0) {
      this.communicationService.customError1('No items selected for return');
      return;
    }

    const discountAmount = this.getReturnDiscount();
    const finalAmount = this.getFinalReturnAmount();

    Swal.fire({
      title: 'Confirm Return Request',
      html: `
        <p>You are about to submit a return request for <strong>${this.returnedItems.length}</strong> items.</p>
        <p>Total return quantity: <strong>${this.getTotalReturnQuantity()}</strong></p>
        <p>Total taxable amount: <strong>₹${this.getTotalReturnTaxableValue().toFixed(2)}</strong></p>
        <p>Total with GST: <strong>₹${this.getTotalReturnWithGST().toFixed(2)}</strong></p>
        ${discountAmount > 0 ? `<p>Discount applied: <strong>₹${discountAmount.toFixed(2)}</strong></p>` : ''}
        <p class="text-success"><strong>Final return amount: ₹${finalAmount.toFixed(2)}</strong></p>
        <br>
        <p class="text-muted">This action cannot be undone.</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Return Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        this.submitReturnRequest();
      }
    });
  }

  private submitReturnRequest() {
    this.loading = true;
    
    const returnData = {
      poId: this.orderData?.poId,
      poNumber: this.orderData?.poNumber,
      invoiceNumber: this.orderData?.invoiceNumber,
      invoiceId: this.responseData?.id,
      invoiceDate: this.orderData?.invoiceDate,
      manufacturerEmail: this.orderData?.manufacturer.email,
      retailerEmail: this.orderData?.retailer.email,
      
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
      retailer: this.orderData?.retailer,
      totalQuantity: this.getTotalReturnQuantity(),
      transportDetails: this.orderData?.transportDetails,
      bankDetails: this.orderData?.bankDetails,
      totalAmount: this.getTotalReturnTaxableValue(),
      discountApplied: this.getReturnDiscount(),
      finalAmount: this.getFinalReturnAmount()
    };

    console.log('Return Request Data:', returnData);

    const url = 'return-r2m';
    
    this.authService.post(url, returnData).subscribe(
      (res: any) => {
        this.loading = false;
        
        // ✅ ONLY update return quantities, NO flag update
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
        }).catch((error: any) => {
          console.error('Error updating return quantities:', error);
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

 // ✅ FIXED: Send entire order data with updated returnQuantity in ONE call
  private updateReturnQuantities(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Update the deliveryItems array with new returnQuantity values
      const updatedDeliveryItems = this.orderData?.deliveryItems.map(item => {
        // Find if this item was returned in current request
        const returnedItem = this.returnedItems.find(ri => ri._id === item._id);
        
        if (returnedItem) {
          // Update returnQuantity for returned items
          const currentReturnQuantity = item.returnQuantity || 0;
          const newReturnQuantity = currentReturnQuantity + (returnedItem.selectedReturnQuantity || 0);
          
          console.log(`Updating ${item.designNumber}: ${currentReturnQuantity} + ${returnedItem.selectedReturnQuantity} = ${newReturnQuantity}`);
          
          return {
            ...item,
            returnQuantity: newReturnQuantity
          };
        }
        
        // Return unchanged for items not being returned
        return item;
      });

      // Send the complete order data with updated deliveryItems
      const updateUrl = `pi-manufacture-to-retailer/${this.orderId}`;
      const updateData = {
        ...this.responseData, // Send entire response data
        deliveryItems: updatedDeliveryItems // With updated returnQuantity
      };

      console.log('Sending complete order data with updated returnQuantity:', updateData);

      this.authService.patchpimage(updateUrl, updateData).subscribe(
        (res: any) => {
          console.log('Return quantities updated successfully');
          resolve(res);
        },
        (error) => {
          console.error('Error updating return quantities:', error);
          reject(error);
        }
      );
    });
  }

  
//   private updateReturnQuantities(): Promise<any> {
//   return new Promise((resolve, reject) => {
//     // Update the deliveryItems array with new returnQuantity values
//     const updatedDeliveryItems = this.orderData?.deliveryItems.map(item => {
//       // Find if this item was returned in current request
//       const returnedItem = this.returnedItems.find(ri => ri._id === item._id);
      
//       if (returnedItem) {
//         // Get current returnQuantity from the item
//         const currentReturnQuantity = item.returnQuantity || 0;
//         const selectedReturnQuantity = returnedItem.selectedReturnQuantity || 0;
//         const newReturnQuantity = currentReturnQuantity + selectedReturnQuantity;
        
//         // ✅ DETAILED LOGGING
//         console.log('=== Return Quantity Calculation ===');
//         console.log(`Item: ${item.designNumber} (${item._id})`);
//         console.log(`Current returnQuantity from backend: ${currentReturnQuantity}`);
//         console.log(`User selected return quantity: ${selectedReturnQuantity}`);
//         console.log(`NEW returnQuantity (should be): ${currentReturnQuantity} + ${selectedReturnQuantity} = ${newReturnQuantity}`);
//         console.log('===================================');
        
//         return {
//           ...item,
//           returnQuantity: newReturnQuantity
//         };
//       }
      
//       // Return unchanged for items not being returned
//       return item;
//     });

//     // Send the complete order data with updated deliveryItems
//     const updateUrl = `pi-manufacture-to-retailer/${this.orderId}`;
//     const updateData = {
//       ...this.responseData,
//       deliveryItems: updatedDeliveryItems
//     };

//     console.log('📤 Sending update with deliveryItems:', JSON.stringify(updatedDeliveryItems, null, 2));

//     this.authService.patchpimage(updateUrl, updateData).subscribe(
//       (res: any) => {
//         console.log('✅ Backend response:', res);
//         console.log('Return quantities updated successfully');
//         resolve(res);
//       },
//       (error) => {
//         console.error('❌ Error updating return quantities:', error);
//         reject(error);
//       }
//     );
//   });
// }

}
