import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./manufaturer-list2/manufaturer-list2.component";
import { WholeselerListComponent } from "./product-management/wholeseler-list/wholeseler-list.component";

export const NewFlow:Route[]=[
    // {path: 'mnf-list', component: ManufaturerList2Component},
    // {path: 'mnf-product', component: ManufaturesProduct2Component},
    // {path: 'view-product', component: ViewProduct2Component},
    // // {path: 'wishlist-product', component: WishlistProductComponent},
    // {path: 'add-to-cart', component: CartProduct2Component},
    // // {path: 'ordered-products', component:OrderedProductComponent},
    // // {path: 'view-Product', component:ViewProductOwnComponent},
    {path:'mnf-list', component:ManufaturerList2Component},
    {path:'pmanage', component:WholeselerListComponent}
]