import { Route } from "@angular/router";
import { MnfListChallanComponent } from "./mnf-list-challan/mnf-list-challan.component";
import { PlaceOrderComponent } from "./place-order/place-order.component";
import { ViewChallanComponent } from "./view-challan/view-challan.component";
import { OrderedProductsComponent } from "./ordered-products/ordered-products.component";
import { InwardStockEntryComponent } from "./inward-stock-entry/inward-stock-entry.component";
import { RetailorPoComponent } from "../new-flow/product-mng/retailor-po/retailor-po.component";
import { RetailorPoGenComponent } from "../new-flow/product-mng/retailor-po/retailor-po-gen/retailor-po-gen.component";
import { RetailerManifacturerPoComponent } from "../new-flow/product-mng/retailer-manifacturer-po/retailer-manifacturer-po.component";
import { ReMaPoShowComponent } from "../new-flow/product-mng/retailer-manifacturer-po/re-ma-po-show/re-ma-po-show.component";

export const Order_Management_Route:Route[]= [
    {path: 'place-order', component: PlaceOrderComponent},
    {path:'view-challan', component:ViewChallanComponent},
    {path:'mnf-list-challan', component:MnfListChallanComponent},
    {path:'ordered-products', component:OrderedProductsComponent},
    {path:'inward-stock', component:InwardStockEntryComponent},
    {path: 'RelatorPo', component: RetailorPoComponent},
    {path: 'viewporetailor', component: RetailorPoGenComponent },
    { path: 'retailormanpo', component: RetailerManifacturerPoComponent },
    {path: 'getmanpo', component: ReMaPoShowComponent },
]