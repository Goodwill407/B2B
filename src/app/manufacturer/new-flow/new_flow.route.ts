import { Route } from "@angular/router";
import { ViewManageProductComponent } from "./product-management/view-manage-product/view-manage-product.component";
import { ViewProductComponent } from "./product-management/view-manage-product/view-product/view-product.component";
import { StepOneComponent } from "./product-management/add-product2/step-one/step-one.component";
import { StepTwoComponent } from "./product-management/add-product2/step-two/step-two.component";
import { StepThreeComponent } from "./product-management/add-product2/step-three/step-three.component";
import { AddProduct2Component } from "./product-management/add-product2/add-product2.component";

export const NewFlow:Route[]=[
    {path:'manage-product',component:AddProduct2Component},
    {path:'step-one',component:StepOneComponent},
    {path:'step-two',component:StepTwoComponent},
    {path:'step-three',component:StepThreeComponent},
    {path:'view-product',component:ViewProductComponent},
]