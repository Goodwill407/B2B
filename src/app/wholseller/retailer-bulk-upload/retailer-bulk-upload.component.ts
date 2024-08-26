import { Component } from '@angular/core';
import { CommunicationService, AuthService } from '@core';
import { BottomSideAdvertiseComponent } from '@core/models/advertisement/bottom-side-advertise/bottom-side-advertise.component';
import { RightSideAdvertiseComponent } from '@core/models/advertisement/right-side-advertise/right-side-advertise.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-retailer-bulk-upload',
  standalone: true,
  imports: [
    ButtonModule ,
    RightSideAdvertiseComponent,
    BottomSideAdvertiseComponent
  ],
  templateUrl: './retailer-bulk-upload.component.html',
  styleUrl: './retailer-bulk-upload.component.scss'
})
export class RetailerBulkUploadComponent {
  selectedFile: File | null = null;
  showTable: boolean = false;
  duplicates: any[] = [];
  nonduplicates: any[] = [];
  showDuplicateTable = false;
  showNonDuplicateTable = false;


  // for ads
  rightAdImages: string[] = [
    'https://en.pimg.jp/081/115/951/1/81115951.jpg',
    'https://en.pimg.jp/087/336/183/1/87336183.jpg'
  ];

  bottomAdImage: string = 'https://elmanawy.info/demo/gusto/cdn/ads/gusto-ads-banner.png';
  constructor(private communicationService:CommunicationService, private http:AuthService){}

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  uploadFile(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      this.http.post('schools/bulkupload', formData).subscribe(
        (response) => {
          this.communicationService.showNotification('snackbar-success', 'File Uploaded Successfully...!!!', 'bottom', 'center')
          this.duplicates = response.duplicates.data;
          this.nonduplicates = response.nonduplicates.data;
          this.showTable = true;
        },
        (error) => {
          this.communicationService.showNotification('snackbar-danger', 'Error uploading file...!!!', 'bottom', 'center')
        }
      );
    } else {
      this.communicationService.showNotification('snackbar-danger', 'Error uploading file...!!!', 'bottom', 'center')
    }
  }
  showDuplicates(): void {
    this.showDuplicateTable = true;
    this.showNonDuplicateTable = false;
  }

  showNonDuplicates(): void {
    this.showDuplicateTable = false;
    this.showNonDuplicateTable = true;
  }

  downloadExcel(type: any) {
    let templateData: any[] = [];
    templateData = [
      {
        Full_Name: "",
        Company_Name: "",
        Role: "",
        Code: "",
        Mobile_Number: "",
        Email: "",
      },
    ];
    this.communicationService.exportToCSV(templateData, 'Sample_CSV');
  }
}
