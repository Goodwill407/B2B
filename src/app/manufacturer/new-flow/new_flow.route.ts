import { Route } from "@angular/router";
import { ViewManageProductComponent } from "./product-management/view-manage-product/view-manage-product.component";
import { ViewProductComponent } from "./product-management/view-manage-product/view-product/view-product.component";
import { StepOneComponent } from "./product-management/add-product2/step-one/step-one.component";
import { StepTwoComponent } from "./product-management/add-product2/step-two/step-two.component";
import { StepThreeComponent } from "./product-management/add-product2/step-three/step-three.component";
import { AddProduct2Component } from "./product-management/add-product2/add-product2.component";
import { RetrunProductsComponent } from "./return-managment/retrun-products/retrun-products.component";
import { ViewReturnProductPoComponent } from "./return-managment/retrun-products/view-return-product-po/view-return-product-po.component";
import { MfgProformaInvoiceListComponent } from "./order-managment/mfg-proforma-invoice-list/mfg-proforma-invoice-list.component";
import { MfgProformaInvoiceViewComponent } from "./order-managment/mfg-proforma-invoice-view/mfg-proforma-invoice-view.component";
import { ReturnOrderRetListComponent } from "./return-managment/return-order-ret-list/return-order-ret-list.component";
import { ReturnOrderRetViewComponent } from "./return-managment/return-order-ret-view/return-order-ret-view.component";
import { RetCreditNoteListComponent } from "./return-managment/ret-credit-note-list/ret-credit-note-list.component";
import { RetailerGroupCreditNoteListComponent } from "./return-managment/retailer-group-credit-note-list/retailer-group-credit-note-list.component";
import { MfgCreditNoteViewComponent } from "app/retailer/new-flow-Product/return-management/mfg-credit-note-view/mfg-credit-note-view.component";
import { CreditNoteUsageDetailViewComponent } from "./return-managment/credit-note-usage-detail-view/credit-note-usage-detail-view.component";
import { WhlCreditNoteListComponent } from "./return-managment/whl-credit-note-list/whl-credit-note-list.component";
import { WhlCreditNoteUsageViewComponent } from "./return-managment/whl-credit-note-usage-view/whl-credit-note-usage-view.component";
import { WhlGroupCreditNoteListComponent } from "./return-managment/whl-group-credit-note-list/whl-group-credit-note-list.component";
import { WhlCreditNoteViewComponent } from "./return-managment/whl-credit-note-view/whl-credit-note-view.component";

export const NewFlow:Route[]=[
    {path:'add-product2',component:AddProduct2Component},
    {path:'manage-product2',component:ViewManageProductComponent},
    {path:'step-one',component:StepOneComponent},
    {path:'step-two',component:StepTwoComponent},
    {path:'step-three',component:StepThreeComponent},
    {path:'view-product',component:ViewProductComponent},
    {path:'Return-products',component:RetrunProductsComponent},
    {path:'Return-products-po',component:ViewReturnProductPoComponent},
    {path:'mfg-proforma-invoice-list', component:MfgProformaInvoiceListComponent},
    {path:'mfg-proforma-invoice-view/:id', component:MfgProformaInvoiceViewComponent},

    {path:'Return-order-ret-view/:id',component:ReturnOrderRetViewComponent},
    {path:'Return-order-ret-list',component:ReturnOrderRetListComponent},

    {path:'ret-credit-note-list/:id', component:RetCreditNoteListComponent},
    {path:'ret-credit-note-usage-view/:id', component:CreditNoteUsageDetailViewComponent},
    {path:'ret-credit-note-group-list', component:RetailerGroupCreditNoteListComponent},
    {path: 'ret-credit-note-view/:id', component:MfgCreditNoteViewComponent},

    {path:'whl-credit-note-list/:id', component: WhlCreditNoteListComponent },
    {path:'whl-credit-note-usage-view/:id', component: WhlCreditNoteUsageViewComponent },
    {path:'whl-credit-note-group-list', component: WhlGroupCreditNoteListComponent},
    {path:'whl-credit-note-view/:id', component: WhlCreditNoteViewComponent}

 

]

