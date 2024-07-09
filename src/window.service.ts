import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  windowRef: any;

  get WindowRef(){
    return window
  }

  constructor() { }
}
