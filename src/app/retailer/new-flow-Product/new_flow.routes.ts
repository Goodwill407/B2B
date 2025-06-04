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
    
]