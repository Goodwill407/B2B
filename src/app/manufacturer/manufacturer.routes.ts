import { Route } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
import { BulkInviteComponent } from "./bulk-invite/bulk-invite.component";
import { AddDistributorComponent } from "./add-distributor/add-distributor.component";
import { InviteStatusComponent } from "./invite-status/invite-status.component";
import { ManageDistributorComponent } from "./manage-distributor/manage-distributor.component";
import { BulkInviteSingleComponent } from "./add-distributor/bulk-invite/bulk-invite.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AddNewProductsComponent } from "./product-manager/add-new-products/add-new-products/add-new-products.component";
import { ViewManageProductComponent } from "./product-manager/view-manage-product/view-manage-product.component";
import { BrandComponent } from "./brand/brand.component";
import { ViewProductComponent } from "./product-manager/view-manage-product/view-product/view-product.component";
import { CategoryComponent } from "./category/category.component";
import { WholselersRequestsComponent } from "./wholselers-requests/wholselers-requests.component";
import { RejectedRequestsListComponent } from "./wholselers-requests/rejected-requests-list/rejected-requests-list.component";
import { WholselerDetailsViewComponent } from "./wholselers-requests/wholseler-details-view/wholseler-details-view.component";
import { WlsListPoComponent } from "./order-management/wls-list-po/wls-list-po.component";
import { DeliveryChallanComponent } from "./order-management/delivery-challan/delivery-challan.component";
import { CustomiseProfileComponent } from "./profile/customise-profile/customise-profile.component";
import { InventryStockComponent } from "./product-manager/inventry-stock/inventry-stock.component";
import { PreviewProfileComponent } from "./profile/customise-profile/preview-profile/preview-profile.component";
import { ProductSummaryComponent } from "./product-manager/inventry-stock/product-summary/product-summary.component";
import { AddNewProduct2Component } from "./product-manager/add-new-product2/add-new-product2.component";


export const M_Auth: Route[] = [
    { path: 'new', loadChildren:()=> import('./new-flow/new_flow.route').then((m)=>m.NewFlow)},
    { path: 'return-mng', loadChildren: () => import('./return-management/return-mng.route').then((m) => m.Return_Mng) },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'brand', component: BrandComponent },
    { path: 'add-new-product', component: AddNewProductsComponent },
    { path: 'add-new-product2', component: AddNewProduct2Component },
    { path: 'new-distributor', component: AddDistributorComponent },
    { path: 'bulk-invite', component: BulkInviteSingleComponent },
    { path: 'bulk-upload', component: BulkInviteComponent },
    { path: 'invite-status', component: InviteStatusComponent },
    { path: 'manage-distributor', component: ManageDistributorComponent },
    { path: 'manage-product', component: ViewManageProductComponent },
    { path: 'view-product', component: ViewProductComponent },
    { path: 'stock-inventory', component: InventryStockComponent },
    { path: 'category', component: CategoryComponent },
    { path: 'wholselers-Requests', component: WholselersRequestsComponent },
    { path: 'Rejected-Requests', component: RejectedRequestsListComponent },
    { path: 'Wholseler-Details', component: WholselerDetailsViewComponent },
    { path: 'wls-list', component: WlsListPoComponent },
    { path: 'delivery-challan', component: DeliveryChallanComponent },
    { path: 'customise_profile', component: CustomiseProfileComponent },
    { path: 'preview-profile', component: PreviewProfileComponent },
    { path: 'product-summary', component: ProductSummaryComponent },
]