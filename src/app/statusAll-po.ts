import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusAllPoDisplay',
  standalone:true
})
export class statusAllPoDisplayPipe implements PipeTransform {
  private statusMap: { [key: string]: string } = {
//     'pending': 'Pending',
//     'm_order_confirmed': 'Manufacturer Confirmed',
//     'm_order_updated': 'Manufacturer Updated',
//     'm_order_cancelled': 'Manufacturer Canceled',
//     'm_partial_delivery': 'Partial Delivery',
//     'r_order_confirmed': 'Retailer Confirmed',
//     'r_order_cancelled': 'Retailer Canceled',
//     'shipped': 'Shipped',
//     'delivered': 'Delivered',
//     'w_order_confirmed': 'Wholesaler Confirmed',
// 'w_order_cancelled' : 'Wholesaler Canceled',
'pending': 'Pending',
      'm_order_confirmed': 'Order Confirmed',
      'm_order_updated': 'Order Updated',
      'm_order_cancelled': 'Order Cancelled',
      'm_partial_delivery': 'Partial Delivery',
      'r_order_confirmed': 'Order Confirmed',
      'r_order_cancelled': 'Order Cancelled',
      'make_to_order': 'Make to Order',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'invoice_generated': 'Invoice Generated'
  };

  transform(value: string): string {
    return this.statusMap[value] || 'N/A';
  }
}
