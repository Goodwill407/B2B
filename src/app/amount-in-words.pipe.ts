import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Pipe({
    name: 'amountInWords',
    standalone: true,
    pure: true // Optional: Improves performance by marking the pipe as pure
})
@Injectable({
  providedIn: 'root'
})
export class AmountInWordsPipe implements PipeTransform {
  private readonly words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven',
    'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  private readonly tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  private numToWords(num: number): string {
    if (num === 0) return '';
    if (num < 20) return this.words[num] + ' ';
    if (num < 100) return this.tens[Math.floor(num / 10)] + ' ' + this.words[num % 10] + ' ';
    if (num < 1000) return this.words[Math.floor(num / 100)] + ' Hundred ' + this.numToWords(num % 100);
    if (num < 100000) return this.numToWords(Math.floor(num / 1000)) + 'Thousand ' + this.numToWords(num % 1000);
    if (num < 10000000) return this.numToWords(Math.floor(num / 100000)) + 'Lakh ' + this.numToWords(num % 100000);
    return this.numToWords(Math.floor(num / 10000000)) + 'Crore ' + this.numToWords(num % 10000000);
  }

  transform(value: number): string {
    if (value == null || isNaN(value)) return '';
    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);

    let inWords = '';
    if (rupees > 0) inWords += this.numToWords(rupees) + 'Rupees ';
    if (paise > 0)  inWords += 'and ' + this.numToWords(paise) + 'Paise ';
    return (inWords.trim() + ' Only').replace(/\s+/g, ' ');
  }
}
