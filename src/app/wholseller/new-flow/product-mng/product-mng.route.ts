import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./manufaturer-list2/manufaturer-list2.component";
import { ManufaturesProduct2Component } from "./manufaturer-list2/manufatures-product2/manufatures-product2.component";
import { ViewProduct2Component } from "./manufaturer-list2/manufatures-product2/view-product2/view-product2.component";
import { CartProduct2Component } from "./cart-product2/cart-product2.component";
import { WishlistProduct2Component } from "./wishlist-product2/wishlist-product2.component";
import { GenratepoComponent } from "./genratepo/genratepo.component";
import { ViewWishlistproductComponent } from "./manufaturer-list2/manufatures-product2/view-wishlistproduct/view-wishlistproduct.component";

export const ProductMng:Route[]=[
    {path: 'wish-list',component:WishlistProduct2Component},
    {path: 'mnf-list', component: ManufaturerList2Component},
    {path: 'mnf-product', component: ManufaturesProduct2Component},
    {path: 'view-product', component: ViewProduct2Component},
    {path: 'view-wishlistproduct', component: ViewWishlistproductComponent},
    // {path: 'wishlist-product', component: WishlistProductComponent},
    {path: 'add-to-cart', component: CartProduct2Component},
    { path: 'viewpo/:id', component: GenratepoComponent },
    // {path: 'ordered-products', component:OrderedProductComponent},
    // {path: 'view-Product', component:ViewProductOwnComponent},
]