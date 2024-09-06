import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate', // Use a name that you will refer to in the template
  standalone: true,
  pure: true // Optional: Improves performance by marking the pipe as pure
})
export class CustomDatePipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {} // Inject Angular's DatePipe

  transform(value: Date | string | number, format: string = 'dd/MM/yyyy'): string | null {
    if (!value) {
      return null;
    }

    // Use Angular's built-in DatePipe to format the date
    return this.datePipe.transform(value, format);
  }
}
