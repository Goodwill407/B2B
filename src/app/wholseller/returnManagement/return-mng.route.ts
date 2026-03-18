import { Route } from "@angular/router";
import { ReturnProductComponent } from "./return-product/return-product.component";
import { ReturnChallanComponent } from "./return-product/return-challan/return-challan.component";
import { ReturnListWhComponent } from "../new-flow/Return-managemnt-wh/return-list-wh/return-list-wh.component";
import { ViewReturnProductPoWhComponent } from "../new-flow/Return-managemnt-wh/return-list-wh/view-return-product-po-wh/view-return-product-po-wh.component";
import { WhlReturnOrderListComponent } from "../new-flow/Return-managemnt-wh/whl-return-order-list/whl-return-order-list.component";
import { WhlReturnOrderViewComponent } from "../new-flow/Return-managemnt-wh/whl-return-order-view/whl-return-order-view.component";
import { MfgWhGroupCreditNoteListComponent } from "../new-flow/Return-managemnt-wh/mfg-wh-credit-note/mfg-wh-group-credit-note-list/mfg-wh-group-credit-note-list.component";
import { MfgWhlCreditNoteListComponent } from "../new-flow/Return-managemnt-wh/mfg-wh-credit-note/mfg-whl-credit-note-list/mfg-whl-credit-note-list.component";
import { MfgWhlCreditNoteViewComponent } from "../new-flow/Return-managemnt-wh/mfg-wh-credit-note/mfg-whl-credit-note-view/mfg-whl-credit-note-view.component";
import { MfgWhlCreditNoteUsageViewComponent } from "../new-flow/Return-managemnt-wh/mfg-wh-credit-note/mfg-whl-credit-note-usage-view/mfg-whl-credit-note-usage-view.component";
import { WhlCreditNoteUsageViewComponent } from "app/manufacturer/new-flow/return-managment/whl-credit-note-usage-view/whl-credit-note-usage-view.component";

export const returnMng:Route[]=[
    {path:'return-product',component:ReturnListWhComponent},
    {path:'return-product-po',component:ViewReturnProductPoWhComponent},
    {path:'return-order',component:ReturnChallanComponent},

    {path:'whl-return-order-list',component: WhlReturnOrderListComponent},
    {path:'whl-return-order-view/:id',component: WhlReturnOrderViewComponent},

    {path:'wh-mfg-group-credit-note',component: MfgWhGroupCreditNoteListComponent },
 
    {path:'whl-credit-note-list/:id', component: MfgWhlCreditNoteListComponent },
    {path:'whl-credit-note-usage-view/:id', component: WhlCreditNoteUsageViewComponent },
    {path: 'whl-credit-note-view/:id', component: MfgWhlCreditNoteViewComponent }
]