import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-add-stock-of-product',
  standalone: true,
  imports: [DatePipe, TableModule, FormsModule],
  templateUrl: './add-stock-of-product.component.html',
  styleUrl: './add-stock-of-product.component.scss'
})
export class AddStockOfProductComponent {

  product: any = null;
  inventoryStock:any = [];
  // totalQuantity:any ;

  universalQuantity: number | null = null;  
  universalAlert: number | null = null;

  constructor(private location:Location, private route:ActivatedRoute, public authService:AuthService, private router:Router, private communicationService:CommunicationService ){}

 ngOnInit() {
  this.route.queryParamMap.subscribe(params => {
    const id = params.get('id');
    console.log('Query param id =', id);
    if (id) this.getProductDetails(id);
  });
}

 getProductDetails(id: string) {
  // const inventoryUrl = `manufacture-inventory`;
  const inventoryUrl = `manufacture-inventory?productId=${id}`;

  this.authService.get(inventoryUrl).subscribe((invRes: any) => {
    const results = invRes?.results || [];

    if (results.length === 0) {
      // No existing inventory, fetch product and build inventory
      this.authService.get('type2-products/' + id).subscribe((res: any) => {
        this.product = res;
        console.log('Fetched product:', this.product);

        this.inventoryStock = this.prepareInventoryInputArray(); // build from product
        console.log('Generated new inventoryStock:', this.inventoryStock);
      });
    } else {

      const designNumber = results[0]?._id ?? 'Unknown Design';

      this.communicationService.showNotification(
        'snackbar-success',
        `Stock Already Added for ${designNumber} update it from stock Inventory.`,
        'bottom',
        'center'
      );
      setTimeout(() => {
        this.router.navigate(
          ['/mnf/update-stocks-for-product'],
          { queryParams: { design: designNumber } }
        );
      }, 1000);  

      // Inventory exists, use entries from API
      const entries = results[0]?.entries || [];

      // this.totalQuantity = invRes.totalQuantity;

      this.inventoryStock = entries.map((entry:any) => ({
        ...entry, // Keep all original fields
        quantity: entry.quantity || 0,
        minimumQuantityAlert: entry.minimumQuantityAlert || 0
      }));

      console.log('Loaded existing inventoryStock:', this.inventoryStock);
    }
  });
}

  prepareInventoryInputArray(): any[] {
  const resultArray: any[] = [];

  const userEmail = this.product?.productBy || '';
  // const manufactureId = this.product?.productBy || '';  // Assuming manufacturer email is used as ID
  const productId = this.product?.id || '';
  const designNumber = this.product?.designNumber || '';
  const brandName = this.product?.brand || '';

  const sizes = this.product?.sizes || [];
  const colourCollections = this.product?.colourCollections || [];

  for (const colour of colourCollections) {
    for (const size of sizes) {
      resultArray.push({
        userEmail: userEmail,
        // manufactureId: manufactureId,
        productId: productId,
        designNumber: designNumber,
        colour: colour.colour && colour.colour.trim() !== '' ? colour.colour : '#ffffff', // fallback to white
        colourName: colour.colourName,
        standardSize: size.standardSize,
        brandSize:size.brandSize,
        quantity: 0,
        minimumQuantityAlert: 0,
        brandName: brandName
      });
    }
  }

  return resultArray;
}

validateQuantity(product: any): void {
  if (product.quantity === null || product.quantity === '' || product.quantity < 0 || isNaN(product.quantity)) {
    product.quantity = 0;
  }
}

validateAlert(product: any): void {
  if (product.minimumQuantityAlert === null || product.minimumQuantityAlert === '' || product.minimumQuantityAlert < 0 || isNaN(product.minimumQuantityAlert)) {
    product.minimumQuantityAlert = 0;
  }
}

blockInvalidKeys(event: KeyboardEvent): void {
  // Prevent e, +, - and . (for integers only)
  if (['e', '+', '-', '.'].includes(event.key)) {
    event.preventDefault();
  }
}

applyUniversalQuantity(): void {
  const qtyToAdd = Number(this.universalQuantity);
  if (!isNaN(qtyToAdd) && qtyToAdd > 0) {
    this.inventoryStock = this.inventoryStock.map((item:any) => ({
      ...item,
      quantity: (Number(item.quantity) || 0) + qtyToAdd
    }));
    this.communicationService.customSuccess(`Added ${qtyToAdd} to all item quantities.`);
  } else {
    this.communicationService.customError('Please enter a valid quantity to add.');
  }

  // Optional: clear input
  this.universalQuantity = null;
}


applyUniversalAlert(): void {
  const alertValue = Number(this.universalAlert);
  if (!isNaN(alertValue) && alertValue >= 0) {
    this.inventoryStock = this.inventoryStock.map((item:any) => ({
      ...item,
      minimumQuantityAlert: alertValue
    }));
    this.communicationService.customSuccess(`Minimum alert quantity to ${alertValue} for all items.`);
  } else {
    this.communicationService.customError('Please enter a valid alert quantity to set.');
  }

  // Optional: reset input
  this.universalAlert = null;
}


get totalQuantity(): number {
  return this.inventoryStock.reduce((sum: number, item: any) => {
    const qty = Number(item.quantity);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);
}


submitStock() {
  // Filter only valid entries
  const validStock = this.inventoryStock.filter((item: any) =>
    item.quantity !== null &&
    item.minimumQuantityAlert !== null &&
    item.quantity > 0 &&
    item.minimumQuantityAlert >= 0
  );

  if (validStock.length === 0) {
    this.communicationService.customError('Please enter valid stock quantities before submitting.');
    return;
  }

  this.authService.post('manufacture-inventory/bulk', validStock).subscribe({
    next: (response) => {
      console.log('Stock submitted successfully:', response);

      const logsPayload = this.createInventoryLogsPayload(validStock);
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
      // this.communicationService.customSuccess('Stock added successfully!');
      // Optionally navigate after success
      // this.router.navigate(['/manufacturer/inventory-management']);
    // },
    error: (error) => {
      console.error('Error submitting stock:', error);
      this.communicationService.customError('Failed to submit stock. Please try again.');
    }
  });
}

createInventoryLogsPayload(stockArray: any[]): any[] {
  const currentUser = this.authService.currentUserValue?.email || 'admin@example.com'; // fallback
  // const now = new Date().toISOString();

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
        previousRemainingQuantity: 0, // Assuming first time insert
        lastUpdatedBy: currentUser,
        // lastUpdatedAt: now
        status:'stock_added'
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
