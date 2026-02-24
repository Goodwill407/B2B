import { Route } from "@angular/router";
import { RetWhPoQtyUpdateComponent } from "./ret-wh-po-qty-update/ret-wh-po-qty-update.component";
import { RetWhPoListComponent } from "./ret-wh-po-list/ret-wh-po-list.component";
import { RetWhPartialPoViewComponent } from "./ret-wh-partial-po-view/ret-wh-partial-po-view.component";
import { RetWhInvoiceViewComponent } from "./ret-wh-invoice-view/ret-wh-invoice-view.component";
import { RetWhConfirmedMtoPoComponent } from "./ret-wh-confirmed-mto-po/ret-wh-confirmed-mto-po.component";
import { RetWhInvoiceListComponent } from "./ret-wh-invoice-list/ret-wh-invoice-list.component";


export const Ret_Wh_Route:Route[]= [
    // {path: '', component: },   ret-wh-flow/
    { path: 'ret-wh-update-qty', component:RetWhPoQtyUpdateComponent },
    { path: 'ret-wh-po-list', component:RetWhPoListComponent },
    { path: 'ret-wh-partial-po-view', component:RetWhPartialPoViewComponent },
    { path: 'ret-wh-confirmed-mto-po-view', component:RetWhConfirmedMtoPoComponent },
    { path: 'ret-wh-invoice-view/:id', component:RetWhInvoiceViewComponent },
    { path: 'ret-wh-invoice-list', component: RetWhInvoiceListComponent},
]