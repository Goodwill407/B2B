import { Route } from "@angular/router";


export const NewFlow:Route[]=[
    {path:'product',loadChildren:()=>import('./product-mng/product-mng.route').then((m)=>m.ProductMng)}
    
]