import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { Role } from '@core/models/role';
import { Router } from '@angular/router';
import { DirectionService } from './direction.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  apiURL: any = 'https://backend.fashiontradershub.com/v1/'; // main server
  // apiURL: any = 'http://165.22.211.140:3000/v1/'; // local server

  token = '';
  headerToken: any;
  loginDetails: any;
  cdnPath:string = 'https://lmscontent-cdn.blr1.digitaloceanspaces.com';

  constructor(private http: HttpClient,private route:Router,private directionService:DirectionService) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
    this.setTokens();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }
  public set currentUserValue(user: any) {
    this.currentUserSubject.next(user);
  }

  post(url: string, data: any) {
    if (url.includes('refresh-tokens')) {
      return this.http.post<any>(this.apiURL + url, data);
    } else {
      return this.http.post<any>(this.apiURL + url, data, { headers: this.headerToken });
    }
  }

  patch(url: string, data: any) {
    const type = Object.getPrototypeOf(data);
    let id: any;
    if (type.append) {
      const stringifyId = JSON.stringify(Object.fromEntries(data));
      const pasrseId = JSON.parse(stringifyId);
      id = pasrseId.id;
      data.delete("id");
    } else {
      id = data.id;
      delete data.id;
    }
    return this.http.patch<any>(this.apiURL + url + "/" + id, data, { headers: this.headerToken });
  }

  get(url: string) {
    return this.http.get<any>(this.apiURL + url, { headers: this.headerToken });
  }

  getById(url: string, id: string) {
    return this.http.get<any>(this.apiURL + url + "/" + id, { headers: this.headerToken });
  }

  delete(url: string, id: any) {
    return this.http.delete<any>(this.apiURL + url + "/" + id, { headers: this.headerToken });
  }

  // patch when email send for patch
  patchWithEmail(url:any,data:any){
    return this.http.patch<any>(this.apiURL + url, data, { headers: this.headerToken });
  }
  deleteWithEmail(url:any){
    return this.http.delete<any>(this.apiURL + url,  { headers: this.headerToken });
  }

  setTokens() {
    const token = JSON.parse(sessionStorage.getItem('tokens') || '{}');
    if (token && token.access) {
      this.token = token.access.token;
      this.headerToken = new HttpHeaders({
        'Authorization': `Bearer ${this.token}`
      });
    }
  }

  setRefreshToken(data: any) {
    sessionStorage.setItem('tokens', JSON.stringify(data));
    this.setTokens();
  }

  setLoginDetails(details: any) {
    this.loginDetails = details.user;
    sessionStorage.setItem('userProfile', JSON.stringify(details.user));
    sessionStorage.setItem('tokens', JSON.stringify(details.tokens));
    this.setTokens();
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(this.currentUserValue);
    this.directionService.hideDialog();
    return of({ success: false });   
    
  }

  
}
