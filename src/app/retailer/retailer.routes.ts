import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileComponent } from "./profile/profile.component";

export const Retailer_Route :Route[]=[
    {path:'dashboard', component:DashboardComponent},
    {path:'retailer-profile', component:ProfileComponent},
]