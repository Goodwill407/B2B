import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export function amountAsyncValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
    const value = control.value;
    if (typeof value === 'string') {
      const hasValidAmount = /\d+/.test(value);
      return of(hasValidAmount ? null : { 'invalidAmount': true });
    }
    return of({ 'invalidAmount': true });
  };
}