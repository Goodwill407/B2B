import { Route } from "@angular/router";
import { CpDashboardComponent } from "./cp-dashboard/cp-dashboard.component";
import { CpProfileComponent } from "./cp-profile/cp-profile.component";
import { CpRecivRequestComponent } from "./cp-reciv-request/cp-reciv-request.component";
import { CpSendRequestComponent } from "./cp-send-request/cp-send-request.component";
import { CpViewMfgDetailsComponent } from "./cp-view-mfg-details/cp-view-mfg-details.component";
import { CpSendRequestByBrandComponent } from "./cp-send-request-by-brand/cp-send-request-by-brand.component";
import { CpAddShopComponent } from "./manage-shop/cp-add-shop/cp-add-shop.component";
import { CpViewShopListComponent } from "./manage-shop/cp-view-shop-list/cp-view-shop-list.component";
import { CpViewShopComponent } from "./manage-shop/cp-view-shop/cp-view-shop.component";
import { CpMfgProductViewComponent } from "./product-management/cp-mfg-product-view/cp-mfg-product-view.component";
import { CpMfgProductListComponent } from "./product-management/cp-mfg-product-list/cp-mfg-product-list.component";
import { CpAssMfgListComponent } from "./product-management/cp-ass-mfg-list/cp-ass-mfg-list.component";
import { CpShopkCartListComponent } from "./product-management/cp-shopk-cart-list/cp-shopk-cart-list.component";
import { CpShopkMfgCartListComponent } from "./product-management/cp-shopk-mfg-cart-list/cp-shopk-mfg-cart-list.component";
import { CpShopkMfgGenPoComponent } from "./product-management/cp-shopk-mfg-gen-po/cp-shopk-mfg-gen-po.component";
import { CpShopkMfgPoListComponent } from "./product-management/cp-shopk-mfg-po-list/cp-shopk-mfg-po-list.component";
import { CpShopkMfgViewPoComponent } from "./product-management/cp-shopk-mfg-view-po/cp-shopk-mfg-view-po.component";
import { CpShopkMfgInvoiceListComponent } from "./product-management/cp-shopk-mfg-invoice-list/cp-shopk-mfg-invoice-list.component";

export const CP_Auth : Route[] = [
    { path: '', redirectTo: 'cp-dashboard', pathMatch: 'full' },
    
    { path: 'cp-dashboard', component: CpDashboardComponent },
    { path: 'cp-profile', component: CpProfileComponent },
    { path: 'cp-received-requests', component: CpRecivRequestComponent },
    { path: 'cp-sent-requests',  component: CpSendRequestComponent },
    { path: 'view-mfg-details', component: CpViewMfgDetailsComponent },
    { path: 'request-to-manufacturer', component: CpSendRequestByBrandComponent }, 
    { path: 'cp-add-shop',    component: CpAddShopComponent },
    { path: 'cp-shop-list',   component: CpViewShopListComponent },
    { path: 'cp-shop',    component: CpViewShopComponent },

    { path: 'cp-ass-mfg-list', component: CpAssMfgListComponent},
    { path: 'cp-mfg-product-list', component: CpMfgProductListComponent},
    { path: 'cp-mfg-product-view/:id', component: CpMfgProductViewComponent},
    { path: 'cp-shopk-cart-list', component: CpShopkCartListComponent },
    { path: 'cp-shopk-mfg-cart-list', component: CpShopkMfgCartListComponent },
    { path: 'cp-shopk-mfg-gen-po', component: CpShopkMfgGenPoComponent },
    { path: 'cp-shopk-mfg-po-list', component: CpShopkMfgPoListComponent },
    { path: 'cp-shopk-mfg-view-po', component: CpShopkMfgViewPoComponent },
    { path: 'cp-shopk-mfg-invoice-list', component: CpShopkMfgInvoiceListComponent },


]

    

