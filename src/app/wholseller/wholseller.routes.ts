import { Route } from "@angular/router";
import { AddRetailerComponent } from "./add-retailer/add-retailer.component";
import { RetailerBulkInviteComponent } from "./add-retailer/retailer-bulk-invite/retailer-bulk-invite.component";
import { RetailerBulkUploadComponent } from "./retailer-bulk-upload/retailer-bulk-upload.component";
import { RetailerInviteStatusComponent } from "./retailer-invite-status/retailer-invite-status.component";
import { ManageRetailerComponent } from "./manage-retailer/manage-retailer.component";
import { WholesalerProfileComponent } from "./wholesaler-profile/wholesaler-profile.component";

export const R_Auth:Route[] = [
    {path: 'wholesaler-profile', component: WholesalerProfileComponent},
    {path: 'new-retailer', component: AddRetailerComponent},
    {path: 'bulk-invite-retailer', component: RetailerBulkInviteComponent},
    {path: 'bulk-upload', component: RetailerBulkUploadComponent},
    {path: 'invite-status', component: RetailerInviteStatusComponent},
    {path: 'manage-retailer', component: ManageRetailerComponent},
]