import { Route } from "@angular/router";
import { OrderReturnComponent } from "./order-return/order-return.component";
import { ReturnChallanComponent } from "./order-return/return-challan/return-challan.component";

export const Return_Mng:Route[]=[
    {path:'order-return', component: OrderReturnComponent}, 
    {path:'return-challan', component: ReturnChallanComponent}, 
]