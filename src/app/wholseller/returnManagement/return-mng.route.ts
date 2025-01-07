import { Route } from "@angular/router";
import { ReturnProductComponent } from "./return-product/return-product.component";
import { ReturnChallanComponent } from "./return-product/return-challan/return-challan.component";
import { ReturnListWhComponent } from "../new-flow/Return-managemnt-wh/return-list-wh/return-list-wh.component";
import { ViewReturnProductPoWhComponent } from "../new-flow/Return-managemnt-wh/return-list-wh/view-return-product-po-wh/view-return-product-po-wh.component";

export const returnMng:Route[]=[
    {path:'return-product',component:ReturnListWhComponent},
    {path:'return-product-po',component:ViewReturnProductPoWhComponent},
    {path:'return-order',component:ReturnChallanComponent}
]