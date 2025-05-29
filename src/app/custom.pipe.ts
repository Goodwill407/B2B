import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianCurrency',
  standalone: true
})
export class IndianCurrencyPipe implements PipeTransform {
  transform(value: number | string): string {
    if (value == null) return '';

    let [integer, decimal] = value.toString().split('.');
    decimal = decimal ? '.' + decimal.slice(0, 2) : '';

    const lastThree = integer.slice(-3);
    const otherNumbers = integer.slice(0, -3);
    const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? ',' : '') + lastThree;

    return formatted + decimal;
  }
}
