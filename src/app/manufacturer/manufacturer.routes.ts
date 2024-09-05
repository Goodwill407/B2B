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
import { CustomiseProfileComponent } from "./profile/customise-profile/customise-profile.component";


export const M_Auth:Route[] = [
    {path: 'dashboard', component: DashboardComponent},
    {path: 'profile', component: ProfileComponent},     
    {path: 'brand', component: BrandComponent}, 
    {path: 'add-new-product', component: AddNewProductsComponent},   
    {path: 'new-distributor', component: AddDistributorComponent},
    {path: 'bulk-invite', component: BulkInviteSingleComponent},
    {path: 'bulk-upload', component: BulkInviteComponent},
    {path: 'invite-status', component: InviteStatusComponent},
    {path: 'manage-distributor', component: ManageDistributorComponent},
    {path: 'manage-product', component: ViewManageProductComponent},
    {path: 'view-product', component: ViewProductComponent},
    {path: 'category', component: CategoryComponent},
    {path: 'wholselers-Requests', component: WholselersRequestsComponent},
    {path: 'Rejected-Requests', component: RejectedRequestsListComponent},
    {path: 'Wholseler-Details', component: WholselerDetailsViewComponent},
    {path: 'wls-list', component: WlsListPoComponent},
    {path: 'customise_profile', component: CustomiseProfileComponent},
]