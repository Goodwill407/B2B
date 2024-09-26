import { Route } from "@angular/router";
import { AddRetailerComponent } from "./add-retailer/add-retailer.component";
import { RetailerBulkInviteComponent } from "./add-retailer/retailer-bulk-invite/retailer-bulk-invite.component";
import { RetailerBulkUploadComponent } from "./retailer-bulk-upload/retailer-bulk-upload.component";
import { RetailerInviteStatusComponent } from "./retailer-invite-status/retailer-invite-status.component";
import { ManageRetailerComponent } from "./manage-retailer/manage-retailer.component";
import { WholesalerProfileComponent } from "./wholesaler-profile/wholesaler-profile.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RequestToManufacturerComponent } from "./request-to-manufacturer/request-to-manufacturer.component";
import { ViewManufacturerDetailsComponent } from "./request-to-manufacturer/view-manufacturer-details/view-manufacturer-details.component";
import { MnfRequestListComponent } from "./request-to-manufacturer/mnf-request-list/mnf-request-list.component";
import { ViewChallanComponent } from "./order-management/view-challan/view-challan.component";
import { MnfListChallanComponent } from "./order-management/mnf-list-challan/mnf-list-challan.component";
import { RetailersRequestsListComponent } from "./retailers-requests-list/retailers-requests-list.component";
import { RejectedRetailersListComponent } from "./retailers-requests-list/rejected-retailers-list/rejected-retailers-list.component";
import { ViewRetailersDetailsComponent } from "./retailers-requests-list/view-retailers-details/view-retailers-details.component";

export const R_Auth:Route[] = [
    {path: 'order-mng',
        loadChildren:() => import('./order-management/order-management.route').then((mod)=>mod.Order_Management_Route)
    },
    {path: 'return-mng',
        loadChildren:() => import('./returnManagement/return-mng.route').then((mod)=>mod.returnMng)
    },
    {path: 'product',
        loadChildren:() => import('./product/product.route').then((mod)=>mod.Product_Route)
    },
    {path: 'dashboard', component: DashboardComponent},
    {path: 'profile', component: WholesalerProfileComponent},
    {path: 'new-retailer', component: AddRetailerComponent},
    {path: 'bulk-invite', component: RetailerBulkInviteComponent},
    {path: 'bulk-upload', component: RetailerBulkUploadComponent},
    {path: 'invite-status', component: RetailerInviteStatusComponent},
    {path: 'manage-retailer', component: ManageRetailerComponent},    
    {path: 'request-to-mnf', component: RequestToManufacturerComponent},
    {path:'mnf-details', component:ViewManufacturerDetailsComponent},
    {path:'requested-mnf_list', component:MnfRequestListComponent},
    {path:'view-challan', component:ViewChallanComponent},
    {path:'mnf-list-challan', component:MnfListChallanComponent},
    {path:'retailers-requests-list', component:RetailersRequestsListComponent},
    {path:'rejected-retailsers-list', component:RejectedRetailersListComponent},
    {path:'view-retailser-Details', component:ViewRetailersDetailsComponent},
]