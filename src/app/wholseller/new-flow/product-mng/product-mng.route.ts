import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./manufaturer-list2/manufaturer-list2.component";
import { ManufaturesProduct2Component } from "./manufaturer-list2/manufatures-product2/manufatures-product2.component";
import { ViewProduct2Component } from "./manufaturer-list2/manufatures-product2/view-product2/view-product2.component";
import { CartProduct2Component } from "./cart-product2/cart-product2.component";
import { WishlistProduct2Component } from "./wishlist-product2/wishlist-product2.component";
import { GenratepoComponent } from "./genratepo/genratepo.component";
import { ViewWishlistproductComponent } from "./manufaturer-list2/manufatures-product2/view-wishlistproduct/view-wishlistproduct.component";
import { EditPriceComponent } from "./manufaturer-list2/manufatures-product2/edit-price/edit-price.component";
import { RetailorPoComponent } from "./retailor-po/retailor-po.component";
import { RetailorPoGenComponent } from "./retailor-po/retailor-po-gen/retailor-po-gen.component";
import { WholesalerDiscountComponent } from "./wholesaler-discount/wholesaler-discount.component";
import { ReMaPoShowComponent } from "./retailer-manifacturer-po/re-ma-po-show/re-ma-po-show.component";
import { ViewMdeliveryChallanComponent } from "./mdelivery-challan/view-mdelivery-challan/view-mdelivery-challan.component";
import { MdeliveryChallanComponent } from "./mdelivery-challan/mdelivery-challan.component";
import { PoQuantityUpdateFromMfgComponent } from "./po-quantity-update-from-mfg/po-quantity-update-from-mfg.component";
import { ViewQuantityUpdaedPoOfMfgComponent } from "./po-quantity-update-from-mfg/view-quantity-updaed-po-of-mfg/view-quantity-updaed-po-of-mfg.component";
import { ViewPartialQuantityRetPoComponent } from "./po-quantity-update-from-mfg/view-partial-quantity-ret-po/view-partial-quantity-ret-po.component";


export const ProductMng:Route[]=[
    {path: 'wish-list',component:WishlistProduct2Component},
    {path: 'mnf-list', component: ManufaturerList2Component},
    {path: 'mnf-product', component: ManufaturesProduct2Component},
    {path: 'view-product', component: ViewProduct2Component},
    {path: 'view-wishlistproduct', component: ViewWishlistproductComponent},
    {path: 'view-product-price', component: EditPriceComponent},
    // {path: 'wishlist-product', component: WishlistProductComponent},
    {path: 'add-to-cart', component: CartProduct2Component},
    {path: 'viewpo/:id', component: GenratepoComponent },
    {path: 'wholesaler-discount', component: WholesalerDiscountComponent},
    {path: 'getmanpo', component: ReMaPoShowComponent },
    {path: 'po-quantity-updated-bymfg', component: PoQuantityUpdateFromMfgComponent},
    {path: 'view-po-quantity-updated-bymfg', component: ViewQuantityUpdaedPoOfMfgComponent},
    {path: 'view-partial-quantity-ret-po', component:ViewPartialQuantityRetPoComponent}
    
    
    // {path: 'ordered-products', component:OrderedProductComponent},
    // {path: 'view-Product', component:ViewProductOwnComponent},
]