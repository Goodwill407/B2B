import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../core/service/payment.service';
import { AuthService, CommunicationService } from '@core';
import Swal from 'sweetalert2';

declare var Razorpay: any;

@Component({
  selector: 'app-subscription-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-page.component.html',
  styleUrl: './subscription-page.component.scss'
})
export class SubscriptionPageComponent implements OnInit {
  isPaying = false;
  isLoadingPlans = false;
  selectedPlanId = '';

  plans: any[] = [];

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoadingPlans = true;
    this.authService.get('subscription-plan').subscribe({
      next: (res: any) => {
        const results = res?.results || [];
        this.plans = results
          .filter((p: any) => p.status === 'active' && !p.isDeleted)
          .map((p: any) => this.mapPlan(p));
        this.isLoadingPlans = false;
      },
      error: () => {
        this.isLoadingPlans = false;
        this.communicationService.showNotification(
          'snackbar-danger',
          'Unable to load subscription plans',
          'bottom',
          'center'
        );
      }
    });
  }

  private mapPlan(p: any) {
    return {
      id: p.id,
      planCode: p.planCode,
      title: p.planName,
      subtitle: p.description,
      amount: p.finalAmount,
      amountInPaise: p.finalAmount * 100,
      extraDays: this.extractExtraDays(p.features),
      badge: p.isPopular ? 'Popular' : (p.isRecommended ? 'Best Value' : ''),
      featured: !!p.isPopular,
      features: p.features || []
    };
  }

  private extractExtraDays(features: string[]): number {
    if (!features?.length) return 0;
    const match = features.join(' ').match(/(\d+)\s*extra days/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  payNow(plan: any) {
  if (this.isPaying) return;

  this.isPaying = true;
  this.selectedPlanId = plan.id;

  // ✅ UPDATED — pass subscriptionId (plan.id), not amount
  this.paymentService.createOrder(plan.id).subscribe({
    next: (order: any) => {
      const currentUser: any = this.authService.currentUserValue || {};

      const options = {
        key: environment.razorpayKey,
        amount: order.amount * 100,          // ✅ backend sends amount in rupees, convert to paise
        currency: order.currency,
        order_id: order.razorpayOrderId,      // ✅ field name changed
        name: 'Fashion Traders Hub',
        description: order.planName || plan.title,
        handler: (response: any) => {
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          this.verifyPayment(verifyPayload);
        },
        modal: {
          ondismiss: () => {
            this.isPaying = false;
            this.selectedPlanId = '';
            this.communicationService.showNotification(
              'snackbar-danger',
              'Payment popup closed.',
              'bottom',
              'center'
            );
          },
        },
        prefill: {
          name: currentUser.fullName || '',
          email: currentUser.actualEmail || currentUser.email || '',
          contact: currentUser.mobileNumber || '',
        },
        theme: {
          color: '#2451c4',
        },
      };

      const razorpay = new Razorpay(options);

      // ✅ NEW — call payment-failed API on failure
      razorpay.on('payment.failed', (response: any) => {
        this.paymentService.paymentFailed({
          razorpayOrderId: response.error.metadata.order_id,
          failureReason: response.error.description,
          failureCode: response.error.code,
          gatewayResponse: response
        }).subscribe();

        this.isPaying = false;
        this.selectedPlanId = '';
        this.communicationService.showNotification(
          'snackbar-danger',
          response?.error?.description || 'Payment failed',
          'bottom',
          'center'
        );
      });

      razorpay.open();
    },
    error: (err) => {
      this.isPaying = false;
      this.selectedPlanId = '';
      this.communicationService.showNotification(
        'snackbar-danger',
        err?.error?.message || 'Unable to create payment order',
        'bottom',
        'center'
      );
    },
  });
}

verifyPayment(payload: any) {
  this.paymentService.verifyPayment(payload).subscribe({
    next: (res: any) => {
      this.isPaying = false;
      this.selectedPlanId = '';

      const currentUser: any = this.authService.currentUserValue || {};
      currentUser.subscriptionStatus = 'active';
      currentUser.subscriptionExpiryDate = res?.payment?.subscriptionExpiryDate; // ✅ store expiry
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      this.authService.currentUserSubject.next(currentUser);

      this.communicationService.showNotification(
        'snackbar-success',
        res?.message || 'Subscription activated successfully',
        'bottom',
        'center'
      );

      setTimeout(() => {
        window.location.href = '/#/mnf/dashboard';
      }, 800);
      
    },
    error: (err) => {
      this.isPaying = false;
      this.selectedPlanId = '';
      this.communicationService.showNotification(
        'snackbar-danger',
        err?.error?.message || 'Payment Verification Failed',
        'bottom',
        'center'
      );
    },
  });
}

  // ---------------- REFERRAL FLOW ----------------

  openReferralPopup() {
    Swal.fire({
      title: 'Referral Code',
      html: `
        <p style="font-size:14px;color:#5d6b81;margin-bottom:16px;">
          Enter referral code to get <strong>1 month free subscription</strong>
        </p>
        <input id="swal-referral-code" class="swal2-input" placeholder="Enter Referral Code" style="text-transform:uppercase;">
        <input id="swal-referral-email" class="swal2-input" placeholder="Enter Your Email" type="email">
      `,
      confirmButtonText: 'Apply Referral',
      confirmButtonColor: '#2451c4',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      focusConfirm: false,
      preConfirm: () => {
        const code = (document.getElementById('swal-referral-code') as HTMLInputElement)?.value?.trim();
        const email = (document.getElementById('swal-referral-email') as HTMLInputElement)?.value?.trim();

        if (!code || !email) {
          Swal.showValidationMessage('Both referral code and email are required');
          return false;
        }

        return this.validateReferralFlow(code, email);
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.saveReferralAndActivate(result.value.code, result.value.email);
      }
    });
  }

  private validateReferralFlow(code: string, email: string): Promise<any> {
    return new Promise((resolve) => {
      this.paymentService.checkReferralCode(code).subscribe({
        next: (res: any) => {
          if (!res?.isValid) {
            Swal.showValidationMessage('Invalid referral code');
            resolve(false);
            return;
          }

          this.paymentService.checkReferralUsage(email, code).subscribe({
            next: (dupRes: any) => {
              if (dupRes?.isDuplicate) {
                Swal.showValidationMessage('Referral code already used by this email');
                resolve(false);
                return;
              }

              resolve({ code, email });
            },
            error: (err) => {
              Swal.showValidationMessage(err?.error?.message || 'Unable to verify referral usage');
              resolve(false);
            }
          });
        },
        error: (err) => {
          Swal.showValidationMessage(err?.error?.message || 'Invalid referral code');
          resolve(false);
        }
      });
    });
  }

  saveReferralAndActivate(code: string, email: string) {
    const currentUser: any = this.authService.currentUserValue || {};
    const byEmail = currentUser.email || currentUser.actualEmail || '';

    this.paymentService.saveReferralUsage({
      byEmail,
      refEmail: email,
      refCode: code
    }).subscribe({
      next: () => {
        this.communicationService.showNotification(
          'snackbar-success',
          'Referral applied! You got 1 month free subscription',
          'bottom',
          'center'
        );

        currentUser.subscriptionStatus = 'active';
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        this.authService.currentUserSubject.next(currentUser);

        this.router.navigate(['/mnf/dashboard']);
      },
      error: (err) => {
        this.communicationService.showNotification(
          'snackbar-danger',
          err?.error?.message || 'Unable to save referral usage',
          'bottom',
          'center'
        );
      }
    });
  }
}