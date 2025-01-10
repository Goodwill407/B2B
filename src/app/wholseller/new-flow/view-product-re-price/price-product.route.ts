import { Route } from "@angular/router";
import { EditRePriceComponent } from "./edit-re-price/edit-re-price.component";
import { EditReProductPriceComponent } from "./edit-re-product-price/edit-re-product-price.component";

export const Productprice:Route[]=[
    {path: 'Priceedit',component:EditRePriceComponent},
    {path: 'Priceproedit',component:EditReProductPriceComponent},
]