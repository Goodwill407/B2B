import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core'; // Assuming this path is correct based on your reference
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  userProfile: any;
  isLoading = true;

  // Data Objects
  retailerPoData: any = {};
  wholesalerPoData: any = {}; // You might need a separate API for this if the structure is identical
  
  productData: any = {};

  inventoryData: any = {};
  
  connectedRetailersCount: number = 0;
  connectedWholesalersCount: number = 0;
  
  pendingInvitesCount: number = 0;
  
  brands: any[] = [];
  brandsCount: number = 0;

  page: number = 1;
  limit: number = 10;

  // New Returns Data (Dummy for now unless you have an API)
  returnsData = {
    total: 15,
    retailerCount: 10,
    wholesalerCount: 5
  };

  // Dummy Data
  rawMaterialStats = { total: 142, critical: 8, low: 15 };
  lowStockProducts = { nearLow: 12, critical: 4 };

  returnCounts: any = {};

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.userProfile = JSON.parse(localStorage.getItem("currentUser")!);
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.getAllBrands();
  }

  getAllBrands() {
  // this.spinner.show(); // Uncomment if you have spinner service
  this.authService.get(`brand?page=${this.page}&limit=${this.limit}&brandOwner=${this.userProfile.email}`).subscribe({
    next: (res: any) => {
      this.brands = res.results;
      this.brandsCount = res.totalResults;
      // this.spinner.hide();
    },
    error: (err: any) => {
      // this.spinner.hide();
      console.error('Error loading brands', err);
      // this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
    }
  });
}

// Helper for image error handling
handleImageError(event: any) {
  event.target.src = 'assets/images/no-image.png'; // Make sure you have a placeholder image
}

  loadDashboardData() {
    this.isLoading = true;
    const email = this.userProfile.email;

    // 1. Retailer PO Counts
    const poReq = this.authService.get(`manufacture-dashboard/retailer-po-counts?email=${email}&role=manufacture`);

    // 2. Product Counts
    const prodReq = this.authService.get(`manufacture-dashboard/product-counts?email=${email}&role=manufacture`);

    // 3. Connected Retailers (for count)
    const retReq = this.authService.get(`manufacturers/get-referred/retailers?page=1&limit=1&refByEmail=${email}`);

    // 4. Connected Wholesalers (for count)
    const whoReq = this.authService.get(`manufacturers/get-referred/manufactures?page=1&limit=1&refByEmail=${email}`);

    // 5. Pending Invites
    const invReq = this.authService.get(`invitations?page=1&limit=1&status=pending&invitedBy=${email}`);

    // 6. Brands
    const brandReq = this.authService.get(`manufacture-dashboard/invitation-counts?email=${email}`);

    const invStockReq = this.authService.get(`manufacture-dashboard/inventory-low-stock-counts?email=${email}`);

    const returnReq = this.authService.get(`manufacture-dashboard/retailer-return-counts?email=${email}&role=manufacture`);

    // Note: If you have a real API for Wholesaler POs, add it here. 
    // For now, I'll use the Retailer PO structure as a placeholder or you can duplicate the call if needed.
    
    forkJoin({
      po: poReq,
      prod: prodReq,
      ret: retReq,
      who: whoReq,
      inv: invReq,
      brand: brandReq,
      invStock: invStockReq ,
      returns: returnReq
    }).subscribe({
      next: (res: any) => {
        this.retailerPoData = res.po.data?.retailerPO || {};
        
        // MOCKING Wholesaler PO Data for now (replace with actual API if distinct)
        this.wholesalerPoData = {
           total: 35, pending: 5, confirmed: 20, partialDelivery: 2, makeToOrder: 3, delivered: 5 
        };

        this.productData = res.prod.data?.productDashboard || {};
        this.connectedRetailersCount = res.ret.totalResults || 0;
        this.connectedWholesalersCount = res.who.totalResults || 0;
        this.pendingInvitesCount = res.inv.totalResults || 0;
        this.inventoryData = res.invStock.data?.inventoryAlerts || {};
        this.returnCounts = res.returns.data?.returnDashboard || {};
        // this.brands = res.brand.results || [];
        // this.brandsCount = res.brand.totalResults || 0;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Dashboard Error:', err);
        this.isLoading = false;
      }
    });
  }

  navigateTo(path: string) {
    if(path) this.router.navigate([path]);
  }
}
