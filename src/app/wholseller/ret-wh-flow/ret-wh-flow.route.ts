import { Route } from "@angular/router";
import { RetWhPoQtyUpdateComponent } from "./ret-wh-po-qty-update/ret-wh-po-qty-update.component";
import { RetWhPoListComponent } from "./ret-wh-po-list/ret-wh-po-list.component";
import { RetWhPartialPoViewComponent } from "./ret-wh-partial-po-view/ret-wh-partial-po-view.component";
import { RetWhInvoiceViewComponent } from "./ret-wh-invoice-view/ret-wh-invoice-view.component";
import { RetWhConfirmedMtoPoComponent } from "./ret-wh-confirmed-mto-po/ret-wh-confirmed-mto-po.component";
import { RetWhInvoiceListComponent } from "./ret-wh-invoice-list/ret-wh-invoice-list.component";
import { RetWhCreditNoteGroupListComponent } from "./ret-wh-return-credit/ret-wh-credit-note-group-list/ret-wh-credit-note-group-list.component";
import { RetWhReturnOrderListComponent } from "./ret-wh-return-credit/ret-wh-return-order-list/ret-wh-return-order-list.component";
import { RetWhReturnOrderViewComponent } from "./ret-wh-return-credit/ret-wh-return-order-view/ret-wh-return-order-view.component";
import { RetWhCreditNoteListComponent } from "./ret-wh-return-credit/ret-wh-credit-note-list/ret-wh-credit-note-list.component";
import { RetWhCreditNoteUsageViewComponent } from "./ret-wh-return-credit/ret-wh-credit-note-usage-view/ret-wh-credit-note-usage-view.component";
import { RetWhCreditNoteViewComponent } from "./ret-wh-return-credit/ret-wh-credit-note-view/ret-wh-credit-note-view.component";


export const Ret_Wh_Route:Route[]= [
    // {path: '', component: },   ret-wh-flow/
    { path: 'ret-wh-update-qty', component:RetWhPoQtyUpdateComponent },
    { path: 'ret-wh-po-list', component:RetWhPoListComponent },
    { path: 'ret-wh-partial-po-view', component:RetWhPartialPoViewComponent },
    { path: 'ret-wh-confirmed-mto-po-view', component:RetWhConfirmedMtoPoComponent },
    { path: 'ret-wh-invoice-view/:id', component:RetWhInvoiceViewComponent },
    { path: 'ret-wh-invoice-list', component: RetWhInvoiceListComponent},

    { path:'ret-wh-Return-order-ret-view/:id',component:RetWhReturnOrderViewComponent },
    { path:'ret-wh-Return-order-ret-list',component:RetWhReturnOrderListComponent },

    { path:'ret-wh-credit-note-list/:id', component:RetWhCreditNoteListComponent },
    { path:'ret-wh-credit-note-usage-view/:id', component:RetWhCreditNoteUsageViewComponent },
    { path:'ret-wh-credit-note-group-list', component:RetWhCreditNoteGroupListComponent },

    { path: 'ret-wh-credit-note-view/:id', component:RetWhCreditNoteViewComponent }
]