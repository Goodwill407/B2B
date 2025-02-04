import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationEnd } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { filter } from 'rxjs';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {  
    // Check token expiration initially
    this.checkTokenExpiration();

    // Check token expiration every minute
    interval(30000).subscribe(() => {
      this.checkTokenExpiration();
    });

    // Subscribe to router events
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.checkTokenExpiration();
    });
  }

  checkTokenExpiration() {
    if (this.isTokenExpired()) {
      this.setNewRefreshToken();
    }
  }

  setNewRefreshToken() {
    const token = JSON.parse(sessionStorage.getItem('tokens') || '{}');
    this.authService.post('auth/refresh-tokens', { refreshToken: token.refresh.token }).subscribe((res: any) => {
      if (res) {
        this.authService.setRefreshToken(res);
      }
    })
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.currentUserValue) {
      const userRole = this.authService.currentUserValue.role;
      const roles = route.data['role'];
      if (roles.includes(userRole)) {
        return true;
      }
    }

    this.router.navigate(['/authentication/signin']);
    return false;
  }

  isTokenExpired(): boolean {
    const token = JSON.parse(sessionStorage.getItem('tokens') || '{}');
    if (token && token.access) {
      const tokenExpiration = new Date(token.access.expires);
      const currentTime = new Date();
      // console.log('token '+tokenExpiration.getTime(), 'currentTime '+currentTime.getTime());      
      return tokenExpiration.getTime() < currentTime.getTime();
    }
    return true;
  }
}
