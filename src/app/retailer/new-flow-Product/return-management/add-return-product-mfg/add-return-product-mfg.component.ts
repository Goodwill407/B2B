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
  productType: string;
  gender: string;
  clothing: string;
  subCategory: string;
  hsnDescription: string;
  hsnCode?: string;
  hsnGst?: number;
  brandName?: string;
  rate?: number;
  // Return specific fields
  returnQuantity?: number;
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

  orderData: OrderData | null = null;
  responseData: any;
  orderId: string;
  loading: boolean = true;
  returnedItems: DeliveryItem[] = [];
  
  isRetailer: boolean = false;
  currentUserRole: string = '';

  returnRequestGenerated: string = "false";
  
  // Return reasons dropdown options
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

  getOrderDetails() {
    this.loading = true;
    
    const url = `pi-manufacture-to-retailer/${this.orderId}`;
    
    this.authService.get(url).subscribe(
      (res: any) => {
        this.responseData = res;
        this.mapOrderData(res);
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
      deliveryItems: data.deliveryItems || [],
      totalQuantity: data.totalQuantity || 0,
      totalAmount: data.totalAmount || 0,
      discountApplied: data.discountApplied || 0,
      finalAmount: data.finalAmount || 0,
      transportDetails: data.transportDetails,
      bankDetails: data.bankDetails,
      returnRequestGenerated: data.returnRequestGenerated || "false"
    };

     this.returnRequestGenerated = data.returnRequestGenerated || "false";
  
  // Show popup if return request already generated
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

  // Navigation function
  navigateFun() {
    this.location.back();
  }

  // Get item rate (price per unit)
  getItemRate(item: DeliveryItem): number {
    if (item.rate) return item.rate;
    
    // Calculate based on total amount if rate not available
    const totalItems = this.orderData?.deliveryItems.reduce((sum, i) => sum + i.quantity, 0) || 1;
    return (this.orderData?.totalAmount || 0) / totalItems;
  }

  // Get taxable value for an item
  getTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * item.quantity;
  }

  // Get total with GST for an item
  getTotalWithGST(item: DeliveryItem): number {
    const taxableValue = this.getTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  // Get return taxable value
  getReturnTaxableValue(item: DeliveryItem): number {
    return this.getItemRate(item) * (item.returnQuantity || 0);
  }

  // Get return total with GST
  getReturnTotalWithGST(item: DeliveryItem): number {
    const taxableValue = this.getReturnTaxableValue(item);
    const gstRate = (item.hsnGst || 0) / 100;
    return taxableValue * (1 + gstRate);
  }

  // Get total taxable value for all items
  getTotalTaxableValue(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTaxableValue(item), 0) || 0;
  }

  // Get total with GST for all items
  getTotalWithAllGST(): number {
    return this.orderData?.deliveryItems.reduce((sum, item) => sum + this.getTotalWithGST(item), 0) || 0;
  }

  // Get total return quantity
  getTotalReturnQuantity(): number {
    return this.returnedItems.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);
  }

  // Get total return taxable value
  getTotalReturnTaxableValue(): number {
    return this.returnedItems.reduce((sum, item) => sum + this.getReturnTaxableValue(item), 0);
  }

  // Get total return with GST
  getTotalReturnWithGST(): number {
    return this.returnedItems.reduce((sum, item) => sum + this.getReturnTotalWithGST(item), 0);
  }

  // Method to handle Add to Return button click with SweetAlert
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

    // if (item.status !== 'pending') {
    //   this.communicationService.customError1('Only pending items can be returned');
    //   return;
    // }

    // Check if item is already in return list
    const existingReturnItem = this.returnedItems.find(returnItem => returnItem._id === item._id);
    if (existingReturnItem) {
      this.communicationService.customError1('This item is already added for return');
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
              <small>Available Quantity: ${item.quantity}</small>
            </div>
          </div>
          
          <div class="form-group mb-3">
            <label for="swal-quantity" class="form-label">Return Quantity:</label>
            <input type="number" id="swal-quantity" class="swal2-input" placeholder="Enter quantity" 
                   min="1" max="${item.quantity}" value="1" style="margin: 0;">
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
        // Handle reason dropdown change
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

        // Validation
        if (!quantity || parseInt(quantity) <= 0) {
          Swal.showValidationMessage('Please enter a valid quantity');
          return false;
        }

        if (parseInt(quantity) > item.quantity) {
          Swal.showValidationMessage(`Quantity cannot exceed available quantity (${item.quantity})`);
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
      // Add item to return list
      const returnItem: DeliveryItem = {
        ...item,
        returnQuantity: formValues.quantity,
        returnReason: formValues.reason,
        customReason: formValues.customReason
      };

      this.returnedItems.push(returnItem);
      this.communicationService.customSuccess(`${formValues.quantity} units of ${item.designNumber} added for return`);
    }
  }

  // Remove item from return list
  removeFromReturn(item: DeliveryItem) {
    const index = this.returnedItems.findIndex(returnItem => returnItem._id === item._id);
    if (index > -1) {
      this.returnedItems.splice(index, 1);
      this.communicationService.customSuccess('Item removed from return list');
    }
  }

  // Process all return requests
  processReturns() {
    if (this.returnedItems.length === 0) {
      this.communicationService.customError1('No items selected for return');
      return;
    }

    Swal.fire({
      title: 'Confirm Return Request',
      html: `
        <p>You are about to submit a return request for <strong>${this.returnedItems.length}</strong> items.</p>
        <p>Total return quantity: <strong>${this.getTotalReturnQuantity()}</strong></p>
        <p>Total return amount: <strong>₹${this.getTotalReturnWithGST().toFixed(2)}</strong></p>
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
    invoiceId: this.responseData?.id, // Using response id as invoiceId
    invoiceDate: this.orderData?.invoiceDate,
    manufacturerEmail: this.orderData?.manufacturer.email,
    retailerEmail: this.orderData?.retailer.email,
    
    deliveryItems: this.returnedItems.map(item => ({
      designNumber: item.designNumber,
      colour: item.colour,
      colourName: item.colourName,
      colourImage: item.colourImage,
      size: item.size,
      orderQuantity: item.quantity, // Original ordered quantity
      returnQuantity: item.returnQuantity, // Quantity being returned
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
      otherReturnReason: item.customReason || '', // Mapped from customReason
      manufacturerComments: '',
      returnStatus: 'requested'
    })),
    
    manufacturer: this.orderData?.manufacturer,
    retailer: this.orderData?.retailer,
    totalQuantity: this.getTotalReturnQuantity(),
    transportDetails: this.orderData?.transportDetails,
    bankDetails: this.orderData?.bankDetails,
    totalAmount: this.getTotalReturnTaxableValue(), // Sum of taxable values for returned items
    finalAmount: this.getTotalReturnWithGST() // Total amount including GST
  };

  console.log('Return Request Data:', returnData); // For debugging

  const url = 'return-r2m';
  
  this.authService.post(url, returnData).subscribe(
    (res: any) => {
      this.loading = false;
      
      // Update the returnRequestGenerated flag
      this.updateReturnRequestFlag().then(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Return request submitted successfully',
          icon: 'success',
          confirmButtonColor: '#28a745'
        }).then(() => {
          this.returnedItems = [];
          this.returnRequestGenerated = "true"; // Set local flag
        });
      }).catch((error:any) => {
        console.error('Error updating return flag:', error);
        // Still show success but warn about flag update failure
        Swal.fire({
          title: 'Success!',
          text: 'Return request submitted successfully',
          icon: 'success',
          confirmButtonColor: '#28a745'
        }).then(() => {
          this.returnedItems = [];
          this.returnRequestGenerated = "true"; // Set local flag anyway
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

private updateReturnRequestFlag(): Promise<any> {
  return new Promise((resolve, reject) => {
    const flagUrl = `pi-manufacture-to-retailer/mark-return-request/${this.orderId}`;
    const flagData = { returnRequestGenerated: "true" };
    // console.log(flagData);
    this.authService.patchpimage(flagUrl, flagData).subscribe(
      (res: any) => {
        console.log('Return request flag updated successfully');
        resolve(res);
      },
      (error) => {
        console.error('Error updating return request flag:', error);
        reject(error);
      }
    );
  });
}


}
