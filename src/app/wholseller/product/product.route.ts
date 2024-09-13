import { Route } from "@angular/router";
import { CartProductComponent } from "./cart-product/cart-product.component";
import { ManufacturerListComponent } from "./manufacturer-list/manufacturer-list.component";
import { ManufacturesProductComponent } from "./manufacturer-list/manufactures-product/manufactures-product.component";
import { ViewProductComponent } from "./manufacturer-list/manufactures-product/view-product/view-product.component";
import { WishlistProductComponent } from "./wishlist-product/wishlist-product.component";
import { OrderedProductComponent } from "./ordered-product/ordered-product.component";
import { ViewProductOwnComponent } from "./ordered-product/view-product-own/view-product-own.component";

export const Product_Route:Route[]= [
    {path: 'mnf-list', component: ManufacturerListComponent},
    {path: 'mnf-product', component: ManufacturesProductComponent},
    {path: 'view-product', component: ViewProductComponent},
    {path: 'wishlist-product', component: WishlistProductComponent},
    {path: 'add-to-cart', component: CartProductComponent},
    {path: 'ordered-products', component:OrderedProductComponent},
    {path: 'view-Product', component:ViewProductOwnComponent},
]