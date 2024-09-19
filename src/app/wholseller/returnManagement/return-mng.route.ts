import { Route } from "@angular/router";
import { ReturnProductComponent } from "./return-product/return-product.component";
import { ReturnChallanComponent } from "./return-product/return-challan/return-challan.component";

export const returnMng:Route[]=[
    {path:'return-product',component:ReturnProductComponent},
    {path:'return-order',component:ReturnChallanComponent}
]