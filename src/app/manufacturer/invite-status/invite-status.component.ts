import { Component } from '@angular/core';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG


@Component({
  selector: 'app-invite-status',
  standalone: true,
  imports: [
    TableModule
  ],
  templateUrl: './invite-status.component.html',
  styleUrl: './invite-status.component.scss'
})
export class InviteStatusComponent {


Distributors:any = [
  { name: 'John Doe', companyName: 'ABC Ltd.', mobileNumber: '1234567890', email: 'john@example.com', city: 'New York', country: 'USA', status: 'Active' },
  { name: 'Jane Smith', companyName: 'XYZ Inc.', mobileNumber: '0987654321', email: 'jane@example.com', city: 'Los Angeles', country: 'USA', status: 'Inactive' },
  { name: 'Michael Brown', companyName: '123 Corp.', mobileNumber: '5678901234', email: 'michael@example.com', city: 'Chicago', country: 'USA', status: 'Active' },
  { name: 'Lisa Johnson', companyName: '789 LLC', mobileNumber: '4321098765', email: 'lisa@example.com', city: 'Houston', country: 'USA', status: 'Inactive' }
];

}
