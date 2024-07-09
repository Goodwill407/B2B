import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  constructor() {
    //constructor
  }

  updateDirection(item: string) {
    this.data.next(item);
  }
}
