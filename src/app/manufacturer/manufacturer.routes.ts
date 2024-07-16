import { Route } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
import { BulkInviteComponent } from "./bulk-invite/bulk-invite.component";
import { AddDistributorComponent } from "./add-distributor/add-distributor.component";
import { InviteStatusComponent } from "./invite-status/invite-status.component";
import { ManageDistributorComponent } from "./manage-distributor/manage-distributor.component";
import { BulkInviteSingleComponent } from "./add-distributor/bulk-invite/bulk-invite.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { AddNewProductsComponent } from "./product-manager/add-new-products/add-new-products/add-new-products.component";


export const M_Auth:Route[] = [
    {path: 'dashboard', component: DashboardComponent},
    {path: 'profile', component: ProfileComponent}, 
    {path: 'add-new-product', component: AddNewProductsComponent},   
    {path: 'new-distributor', component: AddDistributorComponent},
    {path: 'bulk-invite', component: BulkInviteSingleComponent},
    {path: 'bulk-upload', component: BulkInviteComponent},
    {path: 'invite-status', component: InviteStatusComponent},
    {path: 'manage-distributor', component: ManageDistributorComponent},
]