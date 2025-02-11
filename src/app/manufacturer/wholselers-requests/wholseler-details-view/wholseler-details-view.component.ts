import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { CommonModule, Location, NgFor } from '@angular/common';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';

@Component({
  selector: 'app-wholseler-details-view',
  standalone: true,
  imports: [NgFor, CommonModule, CustomDatePipe],
  templateUrl: './wholseler-details-view.component.html',
  styleUrl: './wholseler-details-view.component.scss'
})
export class WholselerDetailsViewComponent {
 
  email:any;
  CompanyData:any;
  data:any
  btnHidden: any = false;
  constructor(private route:ActivatedRoute , private authService:AuthService,private location: Location, private communicationService:CommunicationService){

  }

  ngOnInit(){
    this.route.queryParams.subscribe(params => {
      if (params['data']) {
        this.data = JSON.parse(params['data']); // Parse the JSON string back to an object
        
      }
    });
    this.getSavedProfileData()
  }

  getSavedProfileData() {
    this.authService.get(`wholesaler/${this.data.requestByEmail}`).subscribe((res: any) => {
      if (res) {
        // res.establishDate = res.establishDate ? this.datePipe.transform(res.establishDate, 'yyyy-MM-dd') : null;
        // res.registerOnFTH = res.registerOnFTH ? this.datePipe.transform(res.registerOnFTH, 'yyyy-MM-dd') : null;
        this.CompanyData = res;       
      } else {
        // Handle the case where there's no data
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {
       
      }
    })
  }

  navigateFun() {
    this.location.back();
  } 

  acceptWholselerRequest(): void {
    // Construct the API endpoint URL dynamically
    const endpoint = `request/accept/${this.data.id}/${this.data.requestByEmail}/${this.data.email}`;
    this.btnHidden = true;
    // Create the request payload with the updated status
    const payload = {
      status: 'accepted'  
    };
  
    // Send a POST request to the backend using authService
    this.authService.post(endpoint, payload).subscribe({
      next: (res: any) => {              
        // Show a notification based on the status
        const message = status === 'accepted' ? 'Request Accepted successfully' : 'Request Accepted successfully';
        this.communicationService.showNotification('snackbar-success', message, 'bottom', 'center');
      },
      error: (err: any) => {
        // Handle errors gracefully
        console.error('Error processing request:', err);
        this.communicationService.showNotification('snackbar-error', 'An error occurred while processing the request', 'bottom', 'center');
      }
    });
  }

}
