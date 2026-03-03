import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./Mng-Product/manufaturer-list2/manufaturer-list2.component";

import { WholeselerProductsComponent } from "./Mng-Product/product-management/wholeseler-list/wholeseler-products/wholeseler-products.component";
import { WholeselerListComponent } from "./Mng-Product/product-management/wholeseler-list/wholeseler-list.component";
import { ViewWholeselerProductComponent } from "./Mng-Product/product-management/wholeseler-list/view-wholeseler-product/view-wholeseler-product.component";
import { CartProduct2RetailerComponent } from "./Mng-Product/cart-product2-retailer/cart-product2-retailer.component";
import { GenraterpoComponent } from "./Mng-Product/genraterpo/genraterpo.component";
import { WishlistProduct2Component } from "./Mng-Product/product-management/wishlist-product2/wishlist-product2.component";
import { ViewDetailWishlistComponent } from "./Mng-Product/product-management/wishlist-product2/view-detail-wishlist/view-detail-wishlist.component";
import { ViewRetailerpoComponent } from "./Mng-Product/view-retailerpo/view-retailerpo.component";
import { RetailerpoGenerateComponent } from "./Mng-Product/view-retailerpo/retailerpo-generate/retailerpo-generate.component";
import { ProductViewOfMfgComponent } from "./Mng-Product/product-management/product-list-of-mfg/product-view-of-mfg/product-view-of-mfg.component";
import { ViewProductDetailsComponent } from "./Mng-Product/product-management/product-list-of-mfg/view-product-details/view-product-details.component";
import { CartProduct2RetailerManComponent } from "./Mng-Product/cart-product2-retailer-man/cart-product2-retailer-man.component";
import { GenPoRetailerManComponent } from "./Mng-Product/cart-product2-retailer-man/gen-po-retailer-man/gen-po-retailer-man.component";
import { RetailorManOrderReqComponent } from "./Mng-Product/retailor-man-order-req/retailor-man-order-req.component";
import { ViewRetailorManOrderReqComponent } from "./Mng-Product/retailor-man-order-req/view-retailor-man-order-req/view-retailor-man-order-req.component";
import { ViewRetailorpoManComponent } from "./Mng-Product/view-retailorpo-man/view-retailorpo-man.component";
import { RetailormanpoGenComponent } from "./Mng-Product/view-retailorpo-man/retailormanpo-gen/retailormanpo-gen.component";
import { UpdateRetMfgPoPartialDelComponent } from "./Mng-Product/view-retailorpo-man/update-ret-mfg-po-partial-del/update-ret-mfg-po-partial-del.component";
import { MfgInvoiceListComponent } from "./invoice/mfg-invoice-list/mfg-invoice-list.component";
import { MfgProformaInvoiceViewComponent } from "app/manufacturer/new-flow/order-managment/mfg-proforma-invoice-view/mfg-proforma-invoice-view.component";
import { MfgInvoiceListReturnComponent } from "./return-management/mfg-invoice-list-return/mfg-invoice-list-return.component";
import { AddReturnProductMfgComponent } from "./return-management/add-return-product-mfg/add-return-product-mfg.component";
import { ReturnProductMfgListComponent } from "./return-management/return-product-mfg-list/return-product-mfg-list.component";
import { ReturnOrderMfgViewComponent } from "./return-management/return-order-mfg-view/return-order-mfg-view.component";
import { UpdateRetMfgPoPartialNewComponent } from "./Mng-Product/view-retailorpo-man/update-ret-mfg-po-partial-new/update-ret-mfg-po-partial-new.component";
import { MfgGroupCreditNoteListComponent } from "./return-management/mfg-group-credit-note-list/mfg-group-credit-note-list.component";
import { MfgCreditNoteListComponent } from "./return-management/mfg-credit-note-list/mfg-credit-note-list.component";
import { MfgCreditNoteViewComponent } from "./return-management/mfg-credit-note-view/mfg-credit-note-view.component";
import { CreditNoteUsageDetailViewComponent } from "app/manufacturer/new-flow/return-managment/credit-note-usage-detail-view/credit-note-usage-detail-view.component";
import { WhRetPartialPoUpdateComponent } from "./wh-ret-flow/wh-ret-partial-po-update/wh-ret-partial-po-update.component";
import { WhlInvoiceListComponent } from "./wh-ret-flow/whl-invoice-list/whl-invoice-list.component";
import { WhInvoiceListReturnComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-invoice-list-return/wh-invoice-list-return.component";
import { WhReturnedProductListComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-returned-product-list/wh-returned-product-list.component";
import { WhReturnedProductViewComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-returned-product-view/wh-returned-product-view.component";
import { WhAddReturnComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-add-return/wh-add-return.component";
import { WhGroupCreditNoteListComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-group-credit-note-list/wh-group-credit-note-list.component";
import { WhCreditNoteListComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-credit-note-list/wh-credit-note-list.component";
import { WhCreditNoteViewComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-credit-note-view/wh-credit-note-view.component";
import { WhCreditNoteUsageViewComponent } from "./wh-ret-flow/return-credit-wh-ret/wh-credit-note-usage-view/wh-credit-note-usage-view.component";


export const NewFlow:Route[]=[
    {path:'Manifaturerilist',component:ManufaturerList2Component},
    {path:'wholseller-list3',component:WholeselerListComponent},
    {path:'wholeseler-Products4', component:WholeselerProductsComponent},
    {path:'view-product2', component:ViewWholeselerProductComponent},
    {path:'cart-product2-retailer', component:CartProduct2RetailerComponent},
    {path:'poretailor/:id', component:GenraterpoComponent},
    { path: 'genpoMan/:email/:productBy', component: GenPoRetailerManComponent },
    
    {path:'wishlist-product2', component:WishlistProduct2Component},
    {path:'wishlistproducts', component:ViewDetailWishlistComponent},
    {path:'view-retailerpo',component:ViewRetailerpoComponent},
    {path:'view-ManReq',component:RetailorManOrderReqComponent},
    {path:'retailerpo-generate',component:RetailerpoGenerateComponent},
    {path:'retailer-view-order',component:ViewRetailorManOrderReqComponent},
    {path:'view-product-ofMfg' ,component:ProductViewOfMfgComponent},
    {path:'view-product-details' ,component:ViewProductDetailsComponent},
    {path:'cart-product2-MAn', component:CartProduct2RetailerManComponent},
    {path:'view-retailerpotoman-list',component:ViewRetailorpoManComponent},
     {path:'view-retailerpotoman',component:RetailormanpoGenComponent},
    //  {path:'update-retailerpotoman-partial',component:UpdateRetMfgPoPartialDelComponent},
     {path:'update-retailerpotoman-partial',component:UpdateRetMfgPoPartialNewComponent},
    {path:'mfg-invoice-list', component:MfgInvoiceListComponent },
    {path:'mfg-invoice-view/:id', component:MfgProformaInvoiceViewComponent},
    { path:'mfg-invoice-list-return', component:MfgInvoiceListReturnComponent},

    { path:'add-return-product-mfg/:id', component: AddReturnProductMfgComponent},
    { path:'return-products-mfg-list', component: ReturnProductMfgListComponent},
    { path:'return-order-mfg-view/:id', component: ReturnOrderMfgViewComponent},

    { path: 'mfg-group-credit-note-list', component: MfgGroupCreditNoteListComponent },
    { path: 'mfg-credit-note-list/:id', component: MfgCreditNoteListComponent },
    { path: 'mfg-credit-note-view/:id', component: MfgCreditNoteViewComponent },
    { path: 'mfg-credit-note-usage-view/:id', component:CreditNoteUsageDetailViewComponent },

    { path: 'wh-ret-partial-po-update', component: WhRetPartialPoUpdateComponent },
    { path: 'wh-invoice-list', component: WhlInvoiceListComponent },
    
    // wh- ret - retrurn flow routes
    { path:'whl-invoice-list-return', component:WhInvoiceListReturnComponent},
    { path:'add-return-product-whl/:id', component:WhAddReturnComponent},
    { path:'return-products-whl-list', component: WhReturnedProductListComponent},
    { path:'return-order-whl-view/:id', component: WhReturnedProductViewComponent},

    { path: 'wh-group-credit-note-list', component: WhGroupCreditNoteListComponent },
    { path: 'wh-credit-note-list/:id', component: WhCreditNoteListComponent },
    { path: 'wh-credit-note-view/:id', component: WhCreditNoteViewComponent },
    { path: 'wh-credit-note-usage-view/:id', component: WhCreditNoteUsageViewComponent },


]