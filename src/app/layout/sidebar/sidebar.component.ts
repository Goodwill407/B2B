/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router, NavigationEnd, RouterLinkActive, RouterLink } from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { ROUTES, ROUTES2 } from './sidebar-items';
import { AuthService, Role } from '@core';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [
    NgScrollbar,
    RouterLinkActive,
    RouterLink,
    NgClass,
    TranslateModule,
  ],
})
export class SidebarComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string;
  headerHeight = 60;
  currentRoute?: string;
  showFlag: boolean = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {
    super();
    this.elementRef.nativeElement.closest('body');
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }
  ngOnInit() {
    if (this.authService.currentUserValue) {
      const userRole = this.authService.currentUserValue.role;
      // const userRole = 'Admin'
      this.authService.get('users/' + this.authService.currentUserValue.id).subscribe((res: any) => {
        this.userImg = res.profile ? this.authService.cdnPath + res.profile : 'assets/images/user/person.png';
        this.userFullName = res.fullName;
      }, (error) => {
        this.userImg = 'assets/images/user/person.png';
      });
      if (this.authService.currentUserValue.userCategory == 'setWise') {
        this.sidebarItems = ROUTES.filter(
          (x) => x.role.indexOf(userRole) !== -1 || x.role.indexOf('All') !== -1
        );
      } else {
        this.sidebarItems = ROUTES2.filter(
          (x) => x.role.indexOf(userRole) !== -1 || x.role.indexOf('All') !== -1
        );
      }
      // this.userFullName = this.authService.currentUserValue.username;
      if (userRole === Role.Superadmin) {
        this.userType = "Admin";
      } else if (userRole === Role.Wholesaler) {
        this.userType = 'Wholesaler'
      } else if (userRole === Role.Retailer) {
        this.userType = 'Retailer';
      }
      else if (userRole === Role.skillCounsellor) {
        this.userType = 'Life Skill Trainer';
      }
      else if (userRole === Role.cluster) {
        this.userType = this.authService.currentUserValue.cluster;
      }
      else {
        this.userType = "Manufacturer";
      }
    }

    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }
  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }
  showFlagFun() {
    this.showFlag = !this.showFlag;
  }
}
