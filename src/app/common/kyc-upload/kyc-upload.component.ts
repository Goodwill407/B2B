import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-kyc-upload',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './kyc-upload.component.html',
  styleUrls: ['./kyc-upload.component.scss']
})
export class KycUploadComponent implements OnInit {
  kycForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  selectedFileName: string | null = null;
  @Input() objPath = '';
  @Input() formData: any = {};
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Output() newItemEvent = new EventEmitter<number>();
  submitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService) {}

  ngOnInit(): void {
    this.kycForm = this.fb.group({
      fileName: [this.formData.fileName || '', Validators.required],
      file: ['', Validators.required], // Updated: This will be patched with file or filename
    });

    // Pre-populate the form if file data exists
    if (this.formData.file) {
      this.selectedFileName = this.formData.file;
      this.kycForm.patchValue({ file: this.formData.file }); // Patch the file field with the existing file name
      this.imagePreviewUrl = `${this.authService.cdnPath + this.formData.file}`; // Assuming the path to the file
    }
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      this.selectedFileName = this.selectedFile.name; // Update the selected file name
      this.kycForm.patchValue({ file: this.selectedFile.name }); // Patch the file field with the file name

      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl = reader.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.imagePreviewUrl = null;
      }
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.kycForm.valid) {
      const formData = new FormData(); // Create FormData object for file upload
      formData.append('fileName', this.kycForm.get('fileName')?.value);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile); // Append the file to FormData
      } else {
        formData.append('file', this.kycForm.get('file')?.value); // Use pre-populated file value if available
      }

      this.authService.post(this.objPath, formData).subscribe(
        (res: any) => {
          if (res) {
            this.communicationService.showNotification('snackbar-success', 'File Uploaded Successfully...', 'bottom', 'center');
          }
        },
        error => {
          this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center');
        }
      );
    }
  }

  navigateFun() {
    this.newItemEvent.emit(1);
  }
}
