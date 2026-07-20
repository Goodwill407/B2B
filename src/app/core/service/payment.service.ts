import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  apiURL: string = environment.apiURL;
  headerToken: HttpHeaders;

  constructor(private http: HttpClient) {
    const token = JSON.parse(sessionStorage.getItem('tokens') || '{}');
    this.headerToken = new HttpHeaders({
      'Authorization': `Bearer ${token?.access?.token || ''}`
    });
  }

  // ✅ UPDATED — now takes subscriptionId, not amount
  createOrder(subscriptionId: string) {
    return this.http.post<any>(
      `${this.apiURL}payments/create-order`,
      { subscriptionId },
      { headers: this.headerToken }
    );
  }

  verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    return this.http.post<any>(`${this.apiURL}payments/verify-payment`, data, { headers: this.headerToken });
  }

  // ✅ NEW
  paymentFailed(data: {
    razorpayOrderId: string;
    failureReason: string;
    failureCode: string;
    gatewayResponse: any;
  }) {
    return this.http.post<any>(`${this.apiURL}payments/payment-failed`, data, { headers: this.headerToken });
  }

  // ✅ NEW
  retryPayment(paymentId: string) {
    return this.http.post<any>(`${this.apiURL}payments/retry/${paymentId}`, {}, { headers: this.headerToken });
  }

  // ✅ NEW
  getMyPayments() {
    return this.http.get<any>(`${this.apiURL}payments/my-payments`, { headers: this.headerToken });
  }

  getPayment(paymentId: string) {
    return this.http.get<any>(`${this.apiURL}payments/${paymentId}`, { headers: this.headerToken });
  }

  getLatestPayment(userId: string) {
    return this.http.get<any>(`${this.apiURL}payments/latest/${userId}`, { headers: this.headerToken });
  }

  // ---------------- Referral APIs (unchanged) ----------------

  checkReferralCode(refCode: string) {
    return this.http.post<any>(`${this.apiURL}referral-code-master/check`, { refCode }, { headers: this.headerToken });
  }

  checkReferralUsage(refEmail: string, refCode: string) {
    return this.http.post<any>(`${this.apiURL}referral-code-used/check`, { refEmail, refCode }, { headers: this.headerToken });
  }

  saveReferralUsage(payload: { byEmail: string; refEmail: string; refCode: string }) {
    return this.http.post<any>(`${this.apiURL}referral-code-used`, payload, { headers: this.headerToken });
  }
}