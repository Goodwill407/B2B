import { Component, OnInit } from '@angular/core';
import { AuthService, CommunicationService } from '@core';  // Assuming AuthService is imported here
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';

interface Row {
  colourName: string;
  colour: string;
  quantities: { [size: string]: number };
  availableQuantities: { [size: string]: number };
  totalPrice: number;
  confirmation: string;  // Will be 'accepted' or 'rejected'
  designNumber: string;
  _id: string;
  size: string;
  statusSingle: string;  // Status for each row (pending, approved, rejected)
}

@Component({
  selector: 'app-view-retailor-man-order-req',
  standalone: true,
  imports: [
    CommonModule, FormsModule, AccordionModule, TableModule
  ],
  templateUrl: './view-retailor-man-order-req.component.html',
  styleUrls: ['./view-retailor-man-order-req.component.scss']
})
export class ViewRetailorManOrderReqComponent implements OnInit {
  distributorId: string = '';  // Distributor ID will be fetched dynamically
  userProfile: any;
  sizeHeaders: string[] = [];  // List of sizes to display in the table
  groupedProducts: any[] = [];  // Grouped product data

  poNumber: number = 0;
  retailerEmail: string = '';
  wholesalerEmail: string = '';
  deliveryChallanId: string | null = null;  // Add this line

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private communicationService: CommunicationService
  ) {}
  ngOnInit(): void {
    // Fetch distributorId from route params
    this.distributorId = this.route.snapshot.paramMap.get('id') ?? '';  // Use route parameter or fallback to empty string
    console.log('Distributor ID:', this.distributorId);  // Log to check if distributorId is fetched correctly
  
    if (!this.distributorId) {
      console.error('Distributor ID is missing or invalid!');
      return;  // Prevent the method from executing if distributorId is missing
    }
  
    this.userProfile = JSON.parse(localStorage.getItem('currentUser')!);
    this.getAllProducts();  // Fetch product data
  }
  

  /** Fetch Products from API */
  getAllProducts() {
    const url = `rtl-orderP-request/${this.distributorId}`;
    this.authService.get(url).subscribe(
      (res: any) => {
        if (res.requestedItems) {
          this.poNumber = res.poNumber;
          this.retailerEmail = res.retailerEmail;
          this.wholesalerEmail = res.wholesalerEmail;
          this.deliveryChallanId = res.deliveryChallanId;
          this.processGroupedProducts(res.requestedItems);
        }
      },
      (error) => console.error("Error fetching products", error)
    );
  }

  processGroupedProducts(requestedItems: any[]): void {
    const grouped: any = {};
    this.sizeHeaders = [...new Set(requestedItems.map(item => item.size))].sort();
  
    requestedItems.forEach((item) => {
      console.log('Processing item:', item);  // Check each item in the loop
  
      const key = item.designNumber;
      if (!grouped[key]) {
        grouped[key] = {
          designNumber: key,
          rows: []
        };
      }
  
      let row = grouped[key].rows.find((r: Row) => r.colourName === item.colour);
      if (!row) {
        row = {
          colourName: item.colour,
          colour: item.colour,
          quantities: {},
          availableQuantities: {},
          totalPrice: 0,
          confirmation: '',
          designNumber: item.designNumber,
          _id: item._id,
          size: item.size,
          statusSingle: 'pending'
        };
        grouped[key].rows.push(row);
      }
  
      console.log('Before Assigning Quantities:', row.availableQuantities);
      row.quantities[item.size] = item.orderedQuantity || 0;  // Ensure 0 if not available
      // Only set 'N/A' if availableQuantity is truly 0 or unavailable (null, undefined, etc.)
      row.availableQuantities[item.size] = (item.availableQuantity || item.availableQuantity === 0) ? item.availableQuantity : 0;  
      console.log('After Assigning Quantities:', row.availableQuantities);
    });
  
    this.groupedProducts = Object.values(grouped);
  }
  
  


  /** Update Confirmation Status (Accept/Reject) for a Row */
  updateRowConfirmation(row: Row, status: 'accept' | 'reject'): void {
    row.confirmation = status;
    row.statusSingle = status === 'accept' ? 'approved' : 'rejected';  // Update statusSingle based on action
  }
  submitConfirmation(): void {
    if (!this.distributorId) {
      console.error('Distributor ID is missing!');
      return;
    }
  
    const updatedItems = this.groupedProducts.flatMap(group =>
      group.rows.flatMap((row: Row) =>
        this.sizeHeaders
          .filter(size => row.quantities[size] > 0 || row.availableQuantities[size] > 0) // ✅ Only include valid sizes
          .map(size => ({
            statusSingle: row.statusSingle,
            colourName: row.colourName,
            colour: row.colour,
            size: size,
            designNumber: row.designNumber,
            orderedQuantity: row.quantities[size],
            availableQuantity: row.availableQuantities[size]
          }))
      )
    );
  
    const requestPayload = {
      id: this.distributorId,  // ✅ Distributor ID dynamically assigned
      status: 'checked',
      contativeDate: new Date().toISOString(),
      deliveryChallanId: this.deliveryChallanId || null, // ✅ Dynamic handling of deliveryChallanId
      poNumber: this.poNumber,
      retailerEmail: this.retailerEmail,
      wholesalerEmail: this.wholesalerEmail,
      requestType: 'partial_delivery',
      requestedItems: updatedItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    console.log('Final Payload:', requestPayload);
  
    const apiUrl = `rtl-orderP-request`;
    this.authService.patch(apiUrl, requestPayload).subscribe(
      (response) => {
        console.log('Data successfully submitted:', response);
        this.communicationService.customSuccess1('Submitted Successfully');
      },
      (error) => {
        console.error('Error during submission:', error);
        this.communicationService.customError1('Something Went Wrong');
      }
    );
  }
  

}
