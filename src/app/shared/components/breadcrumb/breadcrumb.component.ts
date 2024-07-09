import { Component, Input } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { RouterLink } from '@angular/router';
import { AuthService, Role } from '@core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
  imports: [RouterLink, FeatherModule],
})
export class BreadcrumbComponent {
  @Input()
  title!: string;
  @Input()
  items!: string[];
  @Input()
  active_item!: string;
  homePath:string='';
  constructor(private authService:AuthService) {
    //constructor
  }
  ngOnInit(){
    const userRole =  this.authService.currentUserValue.role;
    if (userRole === Role.Superadmin) {
      this.homePath = "/admin/dashboard/main";
    } else if (userRole === Role.department) {
      this.homePath = '/department/dashboard';
    } else if (userRole === Role.school) {
      this.homePath = '/school/dashboard';
    } else if (userRole === Role.Student) {
      this.homePath = '/student/dashboard'
    } else if (userRole === Role.counsellor) {
      this.homePath = '/counsellor/dashboard';
    }
     else if (userRole === Role.skillCounsellor) {
      this.homePath = '/skill-trainer/dashboard';
    }
     else if (userRole === Role.cluster) {
      this.homePath = '/cluster/dashboard';
    }
    else{
      this.homePath = '';
    }
  }
}
