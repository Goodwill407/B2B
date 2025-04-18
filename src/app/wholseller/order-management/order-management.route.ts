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
import { MdeliveryChallanComponent } from "../new-flow/product-mng/mdelivery-challan/mdelivery-challan.component";
import { ViewMdeliveryChallanComponent } from "../new-flow/product-mng/mdelivery-challan/view-mdelivery-challan/view-mdelivery-challan.component";
import { ViewDeliveryFinalComponent } from "../new-flow/product-mng/mdelivery-challan/view-delivery-final/view-delivery-final.component";
import { FinalProductWhComponent } from "../new-flow/product-mng/final-product-wh/final-product-wh.component";
import { ViwFinalProductPoWhComponent } from "../new-flow/product-mng/final-product-wh/viw-final-product-po-wh/viw-final-product-po-wh.component";
import { DistributeMProductComponent } from "../new-flow/product-mng/final-product-wh/distribute-m-product/distribute-m-product.component";
import { ViewPlaceOrderPoComponent } from "./place-order/view-place-order-po/view-place-order-po.component";
import { RequestProcessComponent } from "../new-flow/product-mng/request-process/request-process.component";
import { ViewForwardedComponent } from "../new-flow/product-mng/mdelivery-challan/view-forwarded/view-forwarded.component";
import { PerformaInvoiceComponent } from "../new-flow/product-mng/performa-invoice/performa-invoice.component";
import { ReturnProductCheckComponent } from "../new-flow/product-mng/performa-invoice/return-product-check/return-product-check.component";

export const Order_Management_Route:Route[]= [
    {path: 'place-order', component: PlaceOrderComponent},
    {path: 'View-place-order', component: ViewPlaceOrderPoComponent},
    {path:'view-challan', component:ViewChallanComponent},
    {path:'mnf-list-challan', component:MnfListChallanComponent},
    {path:'ordered-products', component:OrderedProductsComponent},
    {path:'inward-stock', component:InwardStockEntryComponent},
    {path: 'RelatorPo', component: RetailorPoComponent},
    {path: 'viewporetailor', component: RetailorPoGenComponent },
    { path: 'retailormanpo', component: RetailerManifacturerPoComponent },
    {path: 'getmanpo', component: ReMaPoShowComponent },
    {path: 'MNFDChalan', component: MdeliveryChallanComponent },
    {path: 'viiw-Accept-product-po', component: ViwFinalProductPoWhComponent },
    {path: 'viiw-return-product', component: ReturnProductCheckComponent },
    {path: 'Distribute-Accept-product-po', component: DistributeMProductComponent },
    {path: 'okproductlist', component: FinalProductWhComponent },
    {path: 'View-MNFDChalan', component: ViewMdeliveryChallanComponent },
    {path: 'View-MNFDChalan-sfinal', component: ViewDeliveryFinalComponent },
    {path: 'RequestProcess',component: RequestProcessComponent}, // not in use
    {path: 'ViewFowarded',component: ViewForwardedComponent},
    {path: 'Performainvoiceshow', component: PerformaInvoiceComponent},
]