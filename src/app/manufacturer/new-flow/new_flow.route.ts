import { Route } from "@angular/router";
import { ViewManageProductComponent } from "./product-management/view-manage-product/view-manage-product.component";
import { ViewProductComponent } from "./product-management/view-manage-product/view-product/view-product.component";

export const NewFlow:Route[]=[
    {path:'manage-product',component:ViewManageProductComponent},
    {path:'view-product',component:ViewProductComponent},
]