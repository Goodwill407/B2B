import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusAllPoDisplay',
  standalone:true
})
export class statusAllPoDisplayPipe implements PipeTransform {
  private statusMap: { [key: string]: string } = {
    'pending': 'Pending',
    'm_order_confirmed': 'Manufacturer Confirmed',
    'm_order_updated': 'Manufacturer Updated',
    'm_order_cancelled': 'Manufacturer Canceled',
    'm_partial_delivery': 'Partial Delivery',
    'r_order_confirmed': 'Retailer Confirmed',
    'r_order_cancelled': 'Retailer Canceled',
    'shipped': 'Shipped',
    'delivered': 'Delivered',

    'w_order_confirmed': 'Wholesaler Confirmed',
'w_order_cancelled' : 'Wholesaler Canceled',
  };

  transform(value: string): string {
    return this.statusMap[value] || 'N/A';
  }
}
