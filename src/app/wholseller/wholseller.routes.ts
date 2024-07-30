import { Route } from "@angular/router";
import { AddRetailerComponent } from "./add-retailer/add-retailer.component";
import { RetailerBulkInviteComponent } from "./add-retailer/retailer-bulk-invite/retailer-bulk-invite.component";
import { RetailerBulkUploadComponent } from "./retailer-bulk-upload/retailer-bulk-upload.component";
import { RetailerInviteStatusComponent } from "./retailer-invite-status/retailer-invite-status.component";
import { ManageRetailerComponent } from "./manage-retailer/manage-retailer.component";
import { WholesalerProfileComponent } from "./wholesaler-profile/wholesaler-profile.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ManufacturerListComponent } from "./product/manufacturer-list/manufacturer-list.component";
import { ManufacturesProductComponent } from "./product/manufacturer-list/manufactures-product/manufactures-product.component";

export const R_Auth:Route[] = [
    {path: 'dashboard', component: DashboardComponent},
    {path: 'profile', component: WholesalerProfileComponent},
    {path: 'new-retailer', component: AddRetailerComponent},
    {path: 'bulk-invite', component: RetailerBulkInviteComponent},
    {path: 'bulk-upload', component: RetailerBulkUploadComponent},
    {path: 'invite-status', component: RetailerInviteStatusComponent},
    {path: 'manage-retailer', component: ManageRetailerComponent},
    {path: 'mnf-list', component: ManufacturerListComponent},
    {path: 'mnf-product', component: ManufacturesProductComponent},
]