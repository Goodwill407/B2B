import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./product-mng/manufaturer-list2/manufaturer-list2.component";
import { ManufaturesProduct2Component } from "./product-mng/manufaturer-list2/manufatures-product2/manufatures-product2.component";
import { ViewProduct2Component } from "./product-mng/manufaturer-list2/manufatures-product2/view-product2/view-product2.component";

export const NewFlow:Route[]=[
    {path: 'mnf-list2', component: ManufaturerList2Component},
    {path: 'mnf-product2', component: ManufaturesProduct2Component},
    {path: 'view-product', component: ViewProduct2Component},
    // {path: 'wishlist-product', component: WishlistProductComponent},
    // {path: 'add-to-cart', component: CartProductComponent},
    // {path: 'ordered-products', component:OrderedProductComponent},
    // {path: 'view-Product', component:ViewProductOwnComponent},
]