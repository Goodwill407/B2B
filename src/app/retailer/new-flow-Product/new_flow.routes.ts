import { Route } from "@angular/router";


export const NewFlow:Route[]=[
    {path:'product',loadChildren:()=>import('./Mng-Product/mng-product.routes').then((m)=>m.ProductMng)}   
     
]