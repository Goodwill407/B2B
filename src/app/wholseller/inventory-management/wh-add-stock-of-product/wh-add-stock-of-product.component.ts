import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wh-add-stock-of-product',
  standalone: true,
  imports: [DatePipe, TableModule, FormsModule, CommonModule],
  templateUrl: './wh-add-stock-of-product.component.html',
  styleUrl: './wh-add-stock-of-product.component.scss'
})
export class WhAddStockOfProductComponent {

  product: any = null;
  inventoryStock: any = [];
  
  universalQuantity: number | null = null;  
  universalAlert: number | null = null;

  hasNewVariants: boolean = false;

  userEmail: string = '';
  companyName: string = '';

  constructor(
    private location: Location, 
    private route: ActivatedRoute, 
    public authService: AuthService, 
    private router: Router, 
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      this.userEmail = params.get('email') || '';
      this.companyName = params.get('CompanyName') || '';
      
      console.log('Query param id =', id);
      console.log('Query param email =', this.userEmail);
      console.log('Query param CompanyName =', this.companyName);
      
      if (id) this.getProductDetails(id);
    });
  }

  // ✅ UPDATED: Split into two steps - fetch product first, then check inventory
  getProductDetails(id: string) {
    // Step 1: Fetch product details first
    this.authService.get('type2-products/' + id).subscribe((res: any) => {
      this.product = res;
      console.log('Fetched product:', this.product);

      // Step 2: Now check inventory with proper params
      this.checkInventoryExists();
    });
  }

  // ✅ NEW METHOD: Check inventory with userEmail, brandName, designNumber
  checkInventoryExists() {
    const inventoryUrl = `wholesaler-inventory?userEmail=${encodeURIComponent(this.userEmail)}&brandName=${encodeURIComponent(this.product.brand)}&designNumber=${encodeURIComponent(this.product.designNumber)}`;
    
    console.log('Checking inventory with URL:', inventoryUrl);

    this.authService.get(inventoryUrl).subscribe((invRes: any) => {
      const results = invRes?.results || [];

      if (results.length === 0) {
        // No existing inventory, build fresh inventory
        console.log('No existing inventory found - creating new');
        this.inventoryStock = this.prepareInventoryInputArray();
        console.log('Generated new inventoryStock:', this.inventoryStock);
      } else {
        // Inventory exists - check for new variants
        console.log('Existing inventory found:', results);
        
        const existingEntries = results[0]?.entries || [];
        const currentProductVariants = this.prepareInventoryInputArray();

        // Detect new variants
        const newVariants = this.detectNewVariants(existingEntries, currentProductVariants);

        if (newVariants.length > 0) {
          // New variants detected - stay on page and allow adding stock
          this.hasNewVariants = true;
          this.inventoryStock = this.mergeInventoryVariants(existingEntries, currentProductVariants);
          
          this.communicationService.showNotification(
            'snackbar-info',
            `${newVariants.length} new color/size variant(s) detected. Add stock for new variants only.`,
            'bottom',
            'center'
          );

          console.log('Merged inventory with new variants:', this.inventoryStock);
          console.log('New variants count:', newVariants.length);
        } else {
          // No new variants - redirect to update page
          const designNumber = this.product.designNumber;

          this.communicationService.showNotification(
            'snackbar-success',
            `Stock Already Added for ${designNumber}. Redirecting to update page.`,
            'bottom',
            'center'
          );

          setTimeout(() => {
            this.router.navigate(
              ['/wholesaler/wh-update-stock-of-product'],
              { queryParams: { design: designNumber } }
            );
          }, 1000);
        }
      }
    }, (error) => {
      console.error('Error checking inventory:', error);
      // If error (like 404), assume no inventory exists
      this.inventoryStock = this.prepareInventoryInputArray();
      console.log('Error occurred - creating new inventory stock');
    });
  }

  prepareInventoryInputArray(): any[] {
    const resultArray: any[] = [];

    const userEmail = this.userEmail || this.authService.currentUserValue?.email || '';
    const productId = this.product?.id || '';
    const designNumber = this.product?.designNumber || '';
    const brandName = this.product?.brand || '';

    const sizes = this.product?.sizes || [];
    const colourCollections = this.product?.colourCollections || [];

    for (const colour of colourCollections) {
      for (const size of sizes) {
        resultArray.push({
          userEmail: userEmail,
          productId: productId,
          designNumber: designNumber,
          colour: colour.colour && colour.colour.trim() !== '' ? colour.colour : '#ffffff',
          colourName: colour.colourName,
          standardSize: size.standardSize,
          brandSize: size.brandSize,
          size: size.standardSize,
          quantity: 0,
          minimumQuantityAlert: 0,
          brandName: brandName,
          isExisting: false,
          isDisabled: false
        });
      }
    }

    return resultArray;
  }

  detectNewVariants(existingEntries: any[], currentVariants: any[]): any[] {
    const existingKeys = new Set(
      existingEntries.map(entry => 
        this.createVariantKey(entry)
      )
    );

    return currentVariants.filter(variant => 
      !existingKeys.has(this.createVariantKey(variant))
    );
  }

  createVariantKey(variant: any): string {
    return `${variant.colour}_${variant.colourName}_${variant.standardSize}_${variant.brandSize}`;
  }

  mergeInventoryVariants(existingEntries: any[], currentVariants: any[]): any[] {
    const mergedInventory: any[] = [];

    const existingMap = new Map(
      existingEntries.map(entry => [
        this.createVariantKey(entry),
        entry
      ])
    );

    currentVariants.forEach(variant => {
      const variantKey = this.createVariantKey(variant);
      const existingEntry = existingMap.get(variantKey);

      if (existingEntry) {
        mergedInventory.push({
          ...variant,
          quantity: existingEntry.quantity || 0,
          minimumQuantityAlert: existingEntry.minimumQuantityAlert || 0,
          _id: existingEntry._id,
          isExisting: true,
          isDisabled: true
        });
      } else {
        mergedInventory.push({
          ...variant,
          quantity: 0,
          minimumQuantityAlert: 0,
          isExisting: false,
          isDisabled: false
        });
      }
    });

    return mergedInventory;
  }

  validateQuantity(product: any): void {
    if (product.isDisabled) return;
    
    if (product.quantity === null || product.quantity === '' || product.quantity < 0 || isNaN(product.quantity)) {
      product.quantity = 0;
    }
  }

  validateAlert(product: any): void {
    if (product.isDisabled) return;
    
    if (product.minimumQuantityAlert === null || product.minimumQuantityAlert === '' || product.minimumQuantityAlert < 0 || isNaN(product.minimumQuantityAlert)) {
      product.minimumQuantityAlert = 0;
    }
  }

  blockInvalidKeys(event: KeyboardEvent): void {
    if (['e', '+', '-', '.'].includes(event.key)) {
      event.preventDefault();
    }
  }

  applyUniversalQuantity(): void {
    const qtyToAdd = Number(this.universalQuantity);
    if (!isNaN(qtyToAdd) && qtyToAdd > 0) {
      this.inventoryStock = this.inventoryStock.map((item: any) => {
        if (!item.isDisabled) {
          return {
            ...item,
            quantity: (Number(item.quantity) || 0) + qtyToAdd
          };
        }
        return item;
      });
      this.communicationService.customSuccess(`Added ${qtyToAdd} to all new item quantities.`);
    } else {
      this.communicationService.customError('Please enter a valid quantity to add.');
    }

    this.universalQuantity = null;
  }

  applyUniversalAlert(): void {
    const alertValue = Number(this.universalAlert);
    if (!isNaN(alertValue) && alertValue >= 0) {
      this.inventoryStock = this.inventoryStock.map((item: any) => {
        if (!item.isDisabled) {
          return {
            ...item,
            minimumQuantityAlert: alertValue
          };
        }
        return item;
      });
      this.communicationService.customSuccess(`Set minimum alert to ${alertValue} for all new items.`);
    } else {
      this.communicationService.customError('Please enter a valid alert quantity to set.');
    }

    this.universalAlert = null;
  }

  get totalQuantity(): number {
    return this.inventoryStock.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity);
      return sum + (isNaN(qty) ? 0 : qty);
    }, 0);
  }

  get newVariantsCount(): number {
    return this.inventoryStock.filter((item: any) => !item.isDisabled).length;
  }

  async confirmAddStock(): Promise<void> {
    const result = await Swal.fire({
      title: 'Add stock into Inventory?',
      text: 'Are you sure you want to add this stock into inventory?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Add',
      cancelButtonText: 'No',
      focusCancel: true,
      reverseButtons: true
    });

    if (result.isConfirmed) {
      this.submitStock();
    }
  }

  submitStock() {
    const validNewStock = this.inventoryStock.filter((item: any) =>
      !item.isDisabled &&
      item.quantity !== null &&
      item.minimumQuantityAlert !== null &&
      item.quantity > 0 &&
      item.minimumQuantityAlert >= 0
    );

    if (validNewStock.length === 0) {
      this.communicationService.customError('Please enter valid stock quantities for new variants before submitting.');
      return;
    }

    const stockToSubmit = validNewStock.map((item: any) => {
      const { isExisting, isDisabled, ...cleanItem } = item;
      return cleanItem;
    });

    this.authService.post('wholesaler-inventory/bulk', stockToSubmit).subscribe({
      next: (response) => {
        console.log('Stock submitted successfully:', response);

        const logsPayload = this.createInventoryLogsPayload(stockToSubmit);
        this.authService.post('wholesaler-inventory-logs', logsPayload).subscribe({
          next: (logRes) => {
            console.log('Inventory logs posted:', logRes);
            this.navigateToProduct();
          },
          error: (logErr) => {
            console.error('Error posting inventory logs:', logErr);
            this.communicationService.customError('Stock saved, but failed to log inventory changes.');
          }
        });
      },
      error: (error) => {
        console.error('Error submitting stock:', error);
        this.communicationService.customError('Failed to submit stock. Please try again.');
      }
    });
  }

  createInventoryLogsPayload(stockArray: any[]): any[] {
    const currentUser = this.authService.currentUserValue?.email || 'admin@example.com';

    return stockArray.map(item => ({
      userEmail: this.userEmail || this.authService.currentUserValue?.email || '',
      productId: item.productId,
      designNumber: item.designNumber,
      colour: item.colour,
      brandName: item.brandName,
      colourName: item.colourName,
      brandSize: item.brandSize,
      standardSize: item.standardSize,
      recordsArray: [
        {
          updatedQuantity: item.quantity,
          previousRemainingQuantity: 0,
          lastUpdatedBy: currentUser,
          status: 'stock_added'
        }
      ]
    }));
  }

  navigateToProduct() {
  this.communicationService.showNotification(
    'snackbar-success',
    'Saved Successfully...!!!',
    'bottom',
    'center'
  );
  setTimeout(() => {
    this.router.navigate(['/wholesaler/new/Price/Priceedit'], {
      queryParams: { 
        email: this.product?.productBy || '', // ✅ CORRECT - manufacturer email
        CompanyName: this.product?.companyName || this.product?.brand || '' // ✅ CORRECT - manufacturer company name
      }
    });
  }, 1500);
}

}
