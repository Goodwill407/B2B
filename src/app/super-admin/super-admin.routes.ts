import { Route } from "@angular/router";
import { SuperAdminDashboardComponent } from "./super-admin-dashboard/super-admin-dashboard.component";
import { CDNMNGComponent } from "./cdn-mng/cdn-mng.component";


export const SA_Auth: Route[] = [
    { path: 'Super-dashboard', component: SuperAdminDashboardComponent },
    { path: 'CDN-Mng', component: CDNMNGComponent },
]