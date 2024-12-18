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


export const NewFlow:Route[]=[
    {path:'Manifaturerilist',component:ManufaturerList2Component},
    {path:'wholseller-list3',component:WholeselerListComponent},
    {path:'wholeseler-Products4', component:WholeselerProductsComponent},
    {path:'view-product2', component:ViewWholeselerProductComponent},
    {path:'cart-product2-retailer', component:CartProduct2RetailerComponent},
    {path:'poretailor/:id', component:GenraterpoComponent},
    {path:'wishlist-product2', component:WishlistProduct2Component},
    {path:'wishlistproducts', component:ViewDetailWishlistComponent},
    {path:'view-retailerpo',component:ViewRetailerpoComponent},
    {path:'retailerpo-generate',component:RetailerpoGenerateComponent}
    
]