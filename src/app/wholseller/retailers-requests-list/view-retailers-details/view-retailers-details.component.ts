import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-view-retailers-details',
  standalone: true,
  imports: [],
  templateUrl: './view-retailers-details.component.html',
  styleUrl: './view-retailers-details.component.scss'
})
export class ViewRetailersDetailsComponent {

  email:any;
  CompanyData:any;
  cdnPath :any
  data:any
  btnHidden:boolean=false;
  datePipe: DatePipe = new DatePipe('en-US'); // Create a DatePipe instance with 'en-US' locale
  constructor(private route:ActivatedRoute , private authService:AuthService, private communicationService:CommunicationService){

  }

  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        this.data = JSON.parse(params['data']); // Parse the JSON string back to an object
        
      }
    });
    this.cdnPath =this.authService.cdnPath
    this.getSavedProfileData()
  }

  getSavedProfileData() {
    this.authService.get(`retailer/${this.data.requestByEmail}`).subscribe((res: any) => {
      if (res) {
        res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
        res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
        this.CompanyData = res;       
      } else {
        // Handle the case where there's no data
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
       
      }
    })
  }

  
  acceptWholselerRequest(): void {
    // Construct the API endpoint URL dynamically
    const endpoint = `request/accept/${this.data.id}/${this.data.requestByEmail}/${this.data.email}`;
    
    // Disable the button immediately to prevent multiple clicks
    this.btnHidden = true;

    // Create the request payload with the updated status
    const payload = {
      status: 'accepted'  
    };

    // Send a POST request to the backend using authService
    this.authService.post(endpoint, payload).subscribe({
      next: (res: any) => {
        // Show a success notification
        this.communicationService.showNotification('snackbar-success', 'Request Accepted successfully', 'bottom', 'center');
      },
      error: (err: any) => {
        // Handle errors gracefully and re-enable the button
        console.error('Error processing request:', err);
        this.communicationService.showNotification('snackbar-error', 'An error occurred while processing the request', 'bottom', 'center');
        this.btnHidden = false;  // Re-enable the button on error
      }
    });
}


}
