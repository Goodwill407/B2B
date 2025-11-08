import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-stock-of-product',
  standalone: true,
  imports: [DatePipe, TableModule, FormsModule, CommonModule],
  templateUrl: './add-stock-of-product.component.html',
  styleUrl: './add-stock-of-product.component.scss'
})
export class AddStockOfProductComponent {

  product: any = null;
  inventoryStock: any = [];
  
  universalQuantity: number | null = null;  
  universalAlert: number | null = null;

  hasNewVariants: boolean = false; // Flag to track if new variants exist

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
      console.log('Query param id =', id);
      if (id) this.getProductDetails(id);
    });
  }

  getProductDetails(id: string) {
    const inventoryUrl = `manufacture-inventory?productId=${id}`;

    this.authService.get(inventoryUrl).subscribe((invRes: any) => {
      const results = invRes?.results || [];

      if (results.length === 0) {
        // No existing inventory, fetch product and build inventory
        this.authService.get('type2-products/' + id).subscribe((res: any) => {
          this.product = res;
          console.log('Fetched product:', this.product);

          this.inventoryStock = this.prepareInventoryInputArray();
          console.log('Generated new inventoryStock:', this.inventoryStock);
        });
      } else {
        // Inventory exists - fetch product and check for new variants
        this.authService.get('type2-products/' + id).subscribe((res: any) => {
          this.product = res;
          console.log('Fetched product:', this.product);

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
            const designNumber = results[0]?._id ?? 'Unknown Design';

            this.communicationService.showNotification(
              'snackbar-success',
              `Stock Already Added for ${designNumber}. Redirecting to update page.`,
              'bottom',
              'center'
            );

            setTimeout(() => {
              this.router.navigate(
                ['/mnf/update-stocks-for-product'],
                { queryParams: { design: designNumber } }
              );
            }, 1000);
          }
        });
      }
    });
  }

  prepareInventoryInputArray(): any[] {
    const resultArray: any[] = [];

    const userEmail = this.product?.productBy || '';
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
          quantity: 0,
          minimumQuantityAlert: 0,
          brandName: brandName,
          isExisting: false, // Flag to mark if this variant already exists
          isDisabled: false  // Flag to control input disable state
        });
      }
    }

    return resultArray;
  }

  // Detect new variants that don't exist in current inventory
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

  // Create unique key for variant comparison
  createVariantKey(variant: any): string {
    return `${variant.colour}_${variant.colourName}_${variant.standardSize}_${variant.brandSize}`;
  }

  // Merge existing inventory with current product variants
  mergeInventoryVariants(existingEntries: any[], currentVariants: any[]): any[] {
    const mergedInventory: any[] = [];

    // Create a map of existing entries for quick lookup
    const existingMap = new Map(
      existingEntries.map(entry => [
        this.createVariantKey(entry),
        entry
      ])
    );

    // Process current product variants
    currentVariants.forEach(variant => {
      const variantKey = this.createVariantKey(variant);
      const existingEntry = existingMap.get(variantKey);

      if (existingEntry) {
        // Existing variant - mark as disabled
        mergedInventory.push({
          ...variant,
          quantity: existingEntry.quantity || 0,
          minimumQuantityAlert: existingEntry.minimumQuantityAlert || 0,
          _id: existingEntry._id,
          isExisting: true,
          isDisabled: true // Disable existing variants
        });
      } else {
        // New variant - keep enabled
        mergedInventory.push({
          ...variant,
          quantity: 0,
          minimumQuantityAlert: 0,
          isExisting: false,
          isDisabled: false // New variants are editable
        });
      }
    });

    return mergedInventory;
  }

  validateQuantity(product: any): void {
    if (product.isDisabled) return; // Don't validate disabled items
    
    if (product.quantity === null || product.quantity === '' || product.quantity < 0 || isNaN(product.quantity)) {
      product.quantity = 0;
    }
  }

  validateAlert(product: any): void {
    if (product.isDisabled) return; // Don't validate disabled items
    
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
      // Only apply to non-disabled (new) items
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
      // Only apply to non-disabled (new) items
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

  // Get count of new (editable) variants
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
    // Filter only NEW variants (non-disabled) with valid data
    const validNewStock = this.inventoryStock.filter((item: any) =>
      !item.isDisabled && // Only new variants
      item.quantity !== null &&
      item.minimumQuantityAlert !== null &&
      item.quantity > 0 &&
      item.minimumQuantityAlert >= 0
    );

    if (validNewStock.length === 0) {
      this.communicationService.customError('Please enter valid stock quantities for new variants before submitting.');
      return;
    }

    // Remove the flags before sending to API
    const stockToSubmit = validNewStock.map((item:any) => {
      const { isExisting, isDisabled, ...cleanItem } = item;
      return cleanItem;
    });

    this.authService.post('manufacture-inventory/bulk', stockToSubmit).subscribe({
      next: (response) => {
        console.log('Stock submitted successfully:', response);

        const logsPayload = this.createInventoryLogsPayload(stockToSubmit);
        this.authService.post('manufacture-inventory-logs', logsPayload).subscribe({
          next: (logRes) => {
            console.log('Inventory logs posted:', logRes);
            this.navigateOnProduct();
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
      userEmail: item.userEmail,
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

  navigateOnProduct() {
    this.communicationService.showNotification(
      'snackbar-success',
      'Saved Successfully...!!!',
      'bottom',
      'center'
    );
    setTimeout(() => {
      this.router.navigate(['mnf/new/manage-product2']);
    }, 1500);
  }
}
