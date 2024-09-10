import { Route } from "@angular/router";
import { MnfListChallanComponent } from "./mnf-list-challan/mnf-list-challan.component";
import { PlaceOrderComponent } from "./place-order/place-order.component";
import { ViewChallanComponent } from "./view-challan/view-challan.component";
import { OrderedProductsComponent } from "./ordered-products/ordered-products.component";
import { InwardStockEntryComponent } from "./inward-stock-entry/inward-stock-entry.component";

export const Order_Management_Route:Route[]= [
    {path: 'place-order', component: PlaceOrderComponent},
    {path:'view-challan', component:ViewChallanComponent},
    {path:'mnf-list-challan', component:MnfListChallanComponent},
    {path:'ordered-products', component:OrderedProductsComponent},
    {path:'inward-stock', component:InwardStockEntryComponent},
]