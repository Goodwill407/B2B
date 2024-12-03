import { Route } from "@angular/router";
import { ManufaturerList2Component } from "./Mng-Product/manufaturer-list2/manufaturer-list2.component";

import { WholeselerProductsComponent } from "./Mng-Product/product-management/wholeseler-list/wholeseler-products/wholeseler-products.component";
import { WholeselerListComponent } from "./Mng-Product/product-management/wholeseler-list/wholeseler-list.component";
import { ViewWholeselerProductComponent } from "./Mng-Product/product-management/wholeseler-list/view-wholeseler-product/view-wholeseler-product.component";


export const NewFlow:Route[]=[
    {path:'Manifaturerilist',component:ManufaturerList2Component},
    {path:'wholseller-list3',component:WholeselerListComponent},
    {path:'wholeseler-Products4', component:WholeselerProductsComponent},
    {path:'view-product2', component:ViewWholeselerProductComponent},
    
    
]