import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, CommunicationService, DirectionService, Role } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxSpinner } from 'ngx-spinner';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule
  ],
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  
    authForm!: UntypedFormGroup;
    submitted = false;
    loading = false;
    error = '';
    hide = true;
    constructor(
      private formBuilder: UntypedFormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private communicationService: CommunicationService,
      private authService: AuthService,
      
    ) {
      super();
    }
  
    ngOnInit() {
      this.authForm = this.formBuilder.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
      });
    }
  
    get f() {
      return this.authForm.controls;
    }

    togglePasswordVisibility() {
      this.hide = !this.hide;
    }
  
    onSubmit() {
      this.submitted = true;
      this.loading = true;
      this.error = '';
      if (this.authForm.invalid) {
        this.error = 'Username and Password not valid !';
        return;
      } else {
       
        const data = {
          email: this.f['email'].value,
          password: this.f['password'].value
        }
        this.authService.post('auth/login', data).subscribe({
          next: (res) => {
            if (res) {
              setTimeout(() => {
                res.user.token = res.tokens.access.token;
                this.authService.setLoginDetails(res);
                localStorage.setItem('currentUser', JSON.stringify(res.user));
                this.authService.currentUserSubject.next(res.user);
                const role = this.authService.currentUserValue.role;
                if (res.user.role === Role.Superadmin || res.user.role === Role.State) {
                  this.router.navigate(['/mnf/dashboard']);
                } else if (role == Role.Manufacture) {
                  this.router.navigate(['/mnf/dashboard']);
                } else if (role === Role.Wholesaler) {
                  this.router.navigate(['/wholesaler/dashboard']);
                } else if (role === Role.Retailer) {
                  this.router.navigate(['/retailer/dashboard']);
                } else {
                  this.router.navigate(['/authentication/signin']);
                }
                this.communicationService.customSuccess(`Login Successfully...!!!`);
                this.loading = false;
              }, 500);
            } else {
              this.error = 'Invalid Login';
            }
          },
          error: (error) => {
            this.error = 'Invalid Credentials';
            this.submitted = false;
            this.loading = false;
          },
        })
      }
    }

    gotoHome(){
      window.open('https://fashiontradershub.com/','_self');
    }

    navigate(email:string){
      if(email){
        this.router.navigate(['/authentication/forgot-password'],{queryParams:{email:email}});
      }else{
        this.communicationService.showNotification('snackbar-danger',`Please Enter your Email`,'bottom','center');
      }      
    }
  }
  
  