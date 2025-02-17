import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-associated-mnf-list',
  standalone: true,
  imports: [TableModule,
    PaginatorModule,
    NgIf,
    NgClass, RouterModule,
    BottomSideAdvertiseComponent,
    RightSideAdvertiseComponent,
    NgxSpinnerModule
  ],
  templateUrl: './associated-mnf-list.component.html',
  styleUrl: './associated-mnf-list.component.scss'
})
export class AssociatedMnfListComponent {
  allMnf: any;
  totalResults: any;
  limit = 10;
  page: number = 1
  first: number = 0;
  rows: number = 10;
  user: any;


   // for ads
   rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string[] = [
    'assets/images/adv/ads2.jpg',
  'assets/images/adv/ads.jpg'
  ];

  constructor(private authService: AuthService, private router: Router,private spinner: NgxSpinnerService,) { }

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.getAllMnf();
  }

  getAllMnf(): void {
    // Construct the API endpoint URL dynamically
    this.spinner.show()    
    const endpoint = `wholesaler/manufactureList/${this.user.email}?page=${this.page}&limit=${this.limit}?userCategory=${this.user.userCategory}`;
    
    // Call the API using the authService
    this.authService.get(endpoint).subscribe({
      next: (res: any) => {
        // Handle the successful response
        this.allMnf = res.docs
        // Assign the data to the local variable
        this.totalResults = res.totalDocs; // Store the total count of documents
        this.spinner.hide()
      },
      error: (err: any) => {
        this.spinner.hide()
        // Handle errors here
        console.error('Error fetching data:', err);
      }
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    this.getAllMnf();
  }

  navigateToProfile(email:any,isForView:any) {
    // Navigate to the target route with email as query parameter
    this.router.navigate(['/wholesaler/mnf-details'],{ queryParams: {email:email,isForView:isForView} });
  }
}

