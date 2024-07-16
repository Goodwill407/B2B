import { ConfigService } from '../../config/config.service';
import { DOCUMENT, NgClass, NgFor, NgIf } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import {
  LanguageService,
  RightSidebarService,
  InConfiguration,
  Role,
  AuthService,
  CommunicationService,
  DirectionService,
} from '@core';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PasswordModule } from 'primeng/password';
interface Notifications {
  message: string;
  time: string;
  icon: string;
  color: string;
  status: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    MatButtonModule,
    MatMenuModule,PasswordModule,
    NgScrollbar,MatBadgeModule,
    FeatherIconsComponent,
    MatIconModule, NgIf,
    NgFor, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule
  ],
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  public config!: InConfiguration;
  userImg?: string;
  userDetail: any;
  homePage?: string;
  isNavbarCollapsed = true;
  flagvalue: string | string[] | undefined;
  countryName: string | string[] = [];
  langStoreValue?: string;
  defaultFlag?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  notifications: any;
  unreadNotificationCount:number= 0;
  href: any;
  hide = true;
  c_hide = true;
  o_hide = true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    private fb: FormBuilder,
    private communicationService: CommunicationService,
    private directionService: DirectionService,
  ) {
    super();
  }
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.svg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.svg', lang: 'de' },
  ];
 
  ngOnInit() {
    this.config = this.configService.configData;
    this.href = this.router.url;
    const userRole = this.authService.currentUserValue.role;
    this.userDetail = this.authService.currentUserValue;
    this.userImg = 'https://e7.pngegg.com/pngimages/81/570/png-clipart-profile-logo-computer-icons-user-user-blue-heroes-thumbnail.png';
    this.docElement = document.documentElement;
    this.getNotification();
    this.formValidate();
    this.directionService.dialogVisibility$.subscribe(visible => {
      this.visible = visible;
    });
  }

  mapReturnFun(data:any){
    return data.map((x: any) => ({
      'message': x.message,
      'time': x.createdAt,
      'icon': 'person_add',
      'color': 'nfc-blue',
      'status': x.read ==true?'msg-read':'msg-unread',
      'id':x._id
    }))
  }

  getNotification(){
    if (this.userDetail.role == 'trainer' || this.userDetail.role == 'skillTrainer') {
      this.authService.get('notification?userId=' + this.userDetail.id).subscribe((res) => {
        this.notifications = this.mapReturnFun(res);
        this.unreadNotificationCount = this.notifications.filter((notification:any) => notification.status === 'msg-unread').length;
      });
    }
    else if (this.userDetail.role == 'school') {
      this.authService.get('notification?userId=' + this.userDetail.username).subscribe((res) => {
        this.notifications = this.mapReturnFun(res);
        this.unreadNotificationCount = this.notifications.filter((notification:any) => notification.status === 'msg-unread').length;
      });
    }
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  markNotificationRead(){
    const data = this.userDetail
    this.authService.patch('notification',{id:data.role=='school'?data.username:data.id}).subscribe((res)=>{console.log(res)});
    this.getNotification();
  } 

  deleteNotification(id:any){
    this.authService.delete('notification/delete',id).subscribe((res)=>{console.log(res)});
    this.getNotification();
    if(this.userDetail.role == 'school'){
      this.router.navigate(['/school/assigned-counsellor']);
    }
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    this.languageService.setLanguage(lang);
  }
  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      sessionStorage.setItem('collapsed_menu', 'false');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      sessionStorage.setItem('collapsed_menu', 'true');
    }
  }
  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }

  passwordForm!: FormGroup;
  visible: boolean = false;

  formValidate() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}') // Minimum 8 characters, at least one letter and one number
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  showDialog() {
    this.visible = true;
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
  }

  onSubmit() {
    if (this.passwordForm.valid) {
      const data: any = {}
      data.password = this.passwordForm.value.newPassword;
      data.oldPassword = this.passwordForm.value.oldPassword;
      data.username = this.userDetail.username;
      this.authService.post('auth/reset-password-with-username', data).subscribe((res: any) => {
        this.communicationService.showNotification('snackbar-success', 'Password Updated Successfully...!!!', 'bottom', 'center')
      }, (err) => {
        if (err.error.message == 'Enter Valid Old Password') {
          this.communicationService.showNotification('snackbar-danger', 'Old Password dose not Match...!!!', 'bottom', 'center');
        } else {
          this.communicationService.showNotification('snackbar-danger', err.error.message, 'bottom', 'center');
        }
        this.passwordForm.reset();
      }
      )
      this.visible = false;
    } else {
      // Handle form errors
      console.log('Form is invalid');
    }
  }
  override ngOnDestroy(): void {
    this.visible = false;
    this.passwordForm.reset();
  }

  timeAgo(createdAt: string): string {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const diffInMs = now.getTime() - createdDate.getTime();
    
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return `${diffInDays} days ago`;
    }
}
}
