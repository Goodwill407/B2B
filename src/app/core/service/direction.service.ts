import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class DirectionService {
  private data = new BehaviorSubject('');
  currentData = this.data.asObservable();

  private dialogVisibilitySource = new BehaviorSubject<boolean>(false);
  dialogVisibility$ = this.dialogVisibilitySource.asObservable();

  showDialog() {
    this.dialogVisibilitySource.next(true);
  }

  hideDialog() {
    this.dialogVisibilitySource.next(false);
  }

  private apiUrl = 'https://api.countrystatecity.in/v1/countries/IN/states/MH/cities';
  private apiKey = 'cjhjU3JQdjZlaThGSWtBOGxHYlUxVm9tSjk3ZFFQQ211MDlwWWNVbw=='; // Replace with your actual API key


  constructor(private http: HttpClient) { }

  getStates(url: any): Observable<any> {
    const headers = new HttpHeaders({
      'X-CSCAPI-KEY': this.apiKey
    });

    return this.http.get(url, { headers });
  }

  getCities(url: any): Observable<any> {
    const headers = new HttpHeaders({
      'X-CSCAPI-KEY': this.apiKey
    });

    return this.http.get(url, { headers });
  }

  updateDirection(item: string) {
    this.data.next(item);
  }
}
