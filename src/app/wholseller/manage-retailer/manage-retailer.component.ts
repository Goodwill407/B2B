import { Component } from '@angular/core';
import { TableModule } from 'primeng/table'; // Import TableModule from PrimeNG

@Component({
  selector: 'app-manage-retailer',
  standalone: true,
  imports: [
    TableModule 
  ],
  templateUrl: './manage-retailer.component.html',
  styleUrl: './manage-retailer.component.scss'
})
export class ManageRetailerComponent {
  
  Distributors:any = [
    { name: 'John Doe', companyName: 'ABC Ltd.', mobileNumber: '1234567890', email: 'john@example.com', city: 'New York', country: 'USA', status: 'Active' },
    { name: 'Jane Smith', companyName: 'XYZ Inc.', mobileNumber: '0987654321', email: 'jane@example.com', city: 'Los Angeles', country: 'USA', status: 'Inactive' },
    { name: 'Michael Brown', companyName: '123 Corp.', mobileNumber: '5678901234', email: 'michael@example.com', city: 'Chicago', country: 'USA', status: 'Active' },
    { name: 'Lisa Johnson', companyName: '789 LLC', mobileNumber: '4321098765', email: 'lisa@example.com', city: 'Houston', country: 'USA', status: 'Inactive' }
  ];
}
