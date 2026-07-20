import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, Role } from '@core';

@Injectable({ providedIn: 'root' })
export class SubscriptionGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.check();
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.check();
  }

  private check(): boolean {
    const user = this.authService.currentUserValue as any;

    if (!user || !user.role) {
      this.router.navigate(['/authentication/signin']);
      return false;
    }

    if (user.role === Role.Superadmin) return true;

    const isManufacturer = user.role === Role.Manufacture || user.role === 'manufacture';
    if (!isManufacturer) return true;

    if (!this.isSubscriptionValid(user)) {
      this.router.navigate(['/authentication/subscription']);
      return false;
    }

    return true;
  }

  private isSubscriptionValid(user: any): boolean {
    if (user.subscriptionStatus !== 'active') return false;

    if (user.subscriptionExpiryDate) {
      const expiry = new Date(user.subscriptionExpiryDate).getTime();
      return expiry > Date.now();
    }

    return true;
  }
}