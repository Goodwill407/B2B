import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileComponent } from "./profile/profile.component";
import { RequestToWholesalerComponent } from "./request-to-wholesaler/request-to-wholesaler.component";
import { RequestedWholesalerListComponent } from "./request-to-wholesaler/requested-wholesaler-list/requested-wholesaler-list.component";
import { ViewWholesalerDetailsComponent } from "./request-to-wholesaler/view-wholesaler-details/view-wholesaler-details.component";
import { WholeselerListComponent } from "./product-management/wholeseler-list/wholeseler-list.component";
import { WholeselerProductsComponent } from "./product-management/wholeseler-list/wholeseler-products/wholeseler-products.component";
import { ViewWholeselerProductComponent } from "./product-management/wholeseler-list/view-wholeseler-product/view-wholeseler-product.component";
import { RetailerMnfAssociatedListComponent } from "./retailer-mnf-associated-list/retailer-mnf-associated-list/retailer-mnf-associated-list.component";
import { RetailerWholAssociatedListComponent } from "./retailer-whol-associated-list/retailer-whol-associated-list/retailer-whol-associated-list.component";
import { ListOfAssoMfgComponent } from "./new-flow-Product/Mng-Product/product-management/product-list-of-mfg/list-of-asso-mfg/list-of-asso-mfg/list-of-asso-mfg.component";
import { RetAddStockOfProductComponent } from "./inventory-management/ret-add-stock-of-product/ret-add-stock-of-product.component";
import { RetUpdateStockOfProductComponent } from "./inventory-management/ret-update-stock-of-product/ret-update-stock-of-product.component";

export const Retailer_Route :Route[]=[ 
    { path: 'new', loadChildren:()=> import('./new-flow-Product/new_flow.routes').then((m)=>m.NewFlow)},
    {path:'dashboard', component:DashboardComponent},
    {path:'retailer-profile', component:ProfileComponent},
    {path:'retailer-mnf-associated-list', component:RetailerMnfAssociatedListComponent},
    {path:'retailer-whol-associated-list', component:RetailerWholAssociatedListComponent},
    {path:'request-to-wholesaler', component:RequestToWholesalerComponent},
    {path:'requested-wholesaler', component:RequestedWholesalerListComponent},
    {path:'view-wholesaler-details', component:ViewWholesalerDetailsComponent},
    {path:'requested-wholesaler-list', component:RequestedWholesalerListComponent},
    {path:'wholeseler-list', component:WholeselerListComponent},
    {path:'wholeseler-Products', component:WholeselerProductsComponent},
    {path:'view-product', component:ViewWholeselerProductComponent},
    {path:'product-list-of-mfg', component:ListOfAssoMfgComponent},

    // New routes by SK 
    { path: 'ret-add-stock-of-product', component: RetAddStockOfProductComponent},
    { path: 'ret-update-stock-of-product', component: RetUpdateStockOfProductComponent }

]