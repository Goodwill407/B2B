import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileComponent } from "./profile/profile.component";
import { RequestToWholesalerComponent } from "./request-to-wholesaler/request-to-wholesaler.component";
import { RequestedWholesalerListComponent } from "./request-to-wholesaler/requested-wholesaler-list/requested-wholesaler-list.component";
import { ViewWholesalerDetailsComponent } from "./request-to-wholesaler/view-wholesaler-details/view-wholesaler-details.component";
import { WholeselerListComponent } from "./product-management/wholeseler-list/wholeseler-list.component";
import { WholeselerProductsComponent } from "./product-management/wholeseler-list/wholeseler-products/wholeseler-products.component";
import { ViewWholeselerProductComponent } from "./product-management/wholeseler-list/view-wholeseler-product/view-wholeseler-product.component";

export const Retailer_Route :Route[]=[
    {path:'dashboard', component:DashboardComponent},
    {path:'retailer-profile', component:ProfileComponent},
    {path:'request-to-wholesaler', component:RequestToWholesalerComponent},
    {path:'requested-wholesaler', component:RequestedWholesalerListComponent},
    {path:'view-wholesaler-details', component:ViewWholesalerDetailsComponent},
    {path:'requested-wholesaler-list', component:RequestedWholesalerListComponent},
    {path:'wholeseler-list', component:WholeselerListComponent},
    {path:'wholeseler-Products', component:WholeselerProductsComponent},
    {path:'view-product', component:ViewWholeselerProductComponent},

]