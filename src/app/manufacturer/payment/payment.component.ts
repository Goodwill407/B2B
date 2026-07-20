import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaymentService } from '../../core/service/payment.service';

declare var Razorpay: any;

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent {
  isPaying = false;

  // ✅ Replace with a real subscription plan id for testing
  testSubscriptionId = 'REPLACE_WITH_VALID_SUBSCRIPTION_PLAN_ID';

  constructor(private paymentService: PaymentService) {}

  payNow() {
    if (this.isPaying) return;

    this.isPaying = true;

    // ✅ UPDATED — pass subscriptionId (string), not amount (number)
    this.paymentService.createOrder(this.testSubscriptionId).subscribe({
      next: (order: any) => {
        const options = {
          key: environment.razorpayKey,
          amount: order.amount * 100,        // backend sends amount in rupees
          currency: order.currency,
          name: 'Fashion Traders Hub',
          description: order.planName || 'Subscription Payment',
          order_id: order.razorpayOrderId,   // ✅ updated field name
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
              console.log('Payment cancelled');
              alert('Payment popup closed.');
            },
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#3399cc',
          },
        };

        const razorpay = new Razorpay(options);

        razorpay.on('payment.failed', (response: any) => {
          this.isPaying = false;
          console.log('Payment failed', response.error);
          alert(response?.error?.description || 'Payment failed');
        });

        razorpay.open();
      },
      error: (err) => {
        this.isPaying = false;
        console.log('Create order error', err);
        alert(err?.error?.message || 'Unable to create payment order');
      },
    });
  }

  verifyPayment(payload: any) {
    this.paymentService.verifyPayment(payload).subscribe({
      next: (res: any) => {
        this.isPaying = false;
        console.log('Payment verified', res);
        alert('Payment Successful!');
      },
      error: (err) => {
        this.isPaying = false;
        console.log('Payment verification failed', err);
        alert(err?.error?.message || 'Payment Verification Failed');
      },
    });
  }
}