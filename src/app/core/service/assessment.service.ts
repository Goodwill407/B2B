import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private token: string = '';
  private headers: HttpHeaders = new HttpHeaders(); // Initialize headers
  tokenValue: any;

  constructor(private http: HttpClient, private authSer: AuthService) {}

  generateToken(username: any): Observable<void> {
    return this.authSer.get(`student/genrate-token?studentId=${username}`).pipe(
      tap((res: any) => {
        this.token = res.token;
        this.tokenValue = res.token;
        this.headers = new HttpHeaders().set('token', this.token); // Update headers with token
      }),
      catchError((error) => {
        console.error('Error generating token:', error);
        return of(); // Return an empty observable on error
      })
    );
  }

  getReport(): Observable<any> {
    return this.http.get('https://assessment-api.idreamcareer.com/v1/report/tenant/get/58', { headers: this.headers });
  }

  generateReport(): Observable<any> {
    return this.http.get('https://assessment-api.idreamcareer.com/v1/report/tenant/re-generate/58', { headers: this.headers });
  }

  checkAssessmentStatus(): Observable<any> {
    return this.getReport();
  }
}
