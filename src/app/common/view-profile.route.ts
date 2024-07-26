import { Route } from "@angular/router";
import { Page404Component } from "app/authentication/page404/page404.component";
import { ViewProfileComponent } from "./view-profile/view-profile.component";

export const Common_Route : Route[]=[
    {path: 'view-profile', component: ViewProfileComponent},
    {path: '**', component: Page404Component},
]