import { Route } from "@angular/router";
import { ProfileComponent } from "./profile/profile.component";
import { BulkInviteComponent } from "./bulk-invite/bulk-invite.component";
import { AddDistributorComponent } from "./add-distributor/add-distributor.component";
import { InviteStatusComponent } from "./invite-status/invite-status.component";
import { ManageDistributorComponent } from "./manage-distributor/manage-distributor.component";
import { BulkInviteSingleComponent } from "./add-distributor/bulk-invite/bulk-invite.component";

export const M_Auth:Route[] = [
    {path: 'profile', component: ProfileComponent},
    {path: 'new-distributor', component: AddDistributorComponent},
    {path: 'bulk-invite', component: BulkInviteSingleComponent},
    {path: 'bulk-upload', component: BulkInviteComponent},
    {path: 'invite-status', component: InviteStatusComponent},
    {path: 'manage-distributor', component: ManageDistributorComponent},
]