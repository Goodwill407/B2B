import { Component } from '@angular/core';
import { AuthService, CommunicationService } from '@core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-bulk-invite',
  standalone: true,
  imports: [
    ButtonModule 
  ],
  templateUrl: './bulk-invite.component.html',
  styleUrl: './bulk-invite.component.scss'
})
export class BulkInviteComponent {
  selectedFile: File | null = null;
  showTable: boolean = false;
  duplicates: any[] = [];
  nonduplicates: any[] = [];
  showDuplicateTable = false;
  showNonDuplicateTable = false;

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
        name: "",
        district: "",
        contact_number: "",
        address: "",
        udisecode: "",
        locationType: "",
        schoolType: "",
        districtCode: "",
        cluster: "",
        clusterCode: "",
        highestClass: "",
        lowestClass: "",
        contactPersonName: "",
      },
    ];
    this.communicationService.exportToCSV(templateData, 'samepleCSV');
  }
}
