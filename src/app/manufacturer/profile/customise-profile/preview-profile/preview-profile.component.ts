import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, CommunicationService } from '@core';
import { Location } from '@angular/common';
import { CustomDatePipe } from 'app/common/custom-pipe.pipe';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ImageDialogComponent } from 'app/ui/modal/image-dialog/image-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-profile',
  standalone: true,
  imports: [
    CommonModule,
    CustomDatePipe,
    NgxSpinnerModule
  ],
  templateUrl: './preview-profile.component.html',
  styleUrl: './preview-profile.component.scss'
})
export class PreviewProfileComponent {

  email: any
  CompanyData: any
  brandsDetails: any
  cdnPath: any
  allVisabilityData: any;
  id: any

  constructor(private route: ActivatedRoute, public authService: AuthService, private location: Location, private spinner: NgxSpinnerService, private dialog: MatDialog) {
    this.cdnPath = authService.cdnPath;
  }

  // Initialize the company data in ngOnInit
  ngOnInit(): void {
    // Access the query parameter
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      this.email = params['email']
      this.getBrandsOfManufacturer();
      this.getProfileVisabilityData();
    });
  }

  getBrandsOfManufacturer() {
    this.authService.get(`brand/visible/brandlist/${this.email}/true`).subscribe((res: any) => {
      if (res) {
        this.brandsDetails = res
      } else {
      }
    }, error => {
      if (error.error.message === "Manufacturer not found") {

      }
    })
  }

  getProfileVisabilityData() {
    this.spinner.show(); 
    setTimeout(() => {
      this.spinner.hide();
    },1000)
    this.authService.get(`manufacturers/visible-profile/${this.id}`).subscribe((res: any) => {
      if (res) {
        this.allVisabilityData = res;
        const uniqueValues = {
          productType: new Set<string>(),
          gender: new Set<string>(),
          clothing: new Set<string>(),
          subCategory: new Set<string>()
        };
        
        const data = res.uniqueProducts.forEach((product: any) => {
          uniqueValues.productType.add(product.productType);
          uniqueValues.gender.add(product.gender);
          uniqueValues.clothing.add(product.clothing);
          uniqueValues.subCategory.add(product.subCategory);
        });
        
        this.allVisabilityData.dealingIn = {
          productType: Array.from(uniqueValues.productType).join(', '),
          gender: Array.from(uniqueValues.gender).join(', '),
          clothing: Array.from(uniqueValues.clothing).join(', '),
          subCategory: Array.from(uniqueValues.subCategory).join(', ')
        };
      
        this.spinner.hide();
      } else {
      }
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      if (error.error.message === "Manufacturer not found") {
        // this.getRegisteredUserData();
      }
    })
  }

  navigateFun() {
    this.location.back();
  }

  openImg(path:any,size:number){
    const dialogRef = this.dialog.open(ImageDialogComponent, {
      width: size+'px',
      data: {path:path,width:size}  // Pass the current product data
    });
  }
}
