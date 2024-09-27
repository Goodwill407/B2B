import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, CommunicationService } from '@core';

@Component({
  selector: 'app-kyc-upload',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './kyc-upload.component.html',
  styleUrls: ['./kyc-upload.component.scss']
})
export class KycUploadComponent implements OnInit {
  kycForm!: FormGroup;
  selectedFile: File | null = null;
  profileImgFile: File | null = null;
  imagePreviewUrl: string | null = null;
  profileImgPreviewUrl: string | null = null;
  selectedFileName: string | null = null;
  selectedProfileImgName: string | null = null;
  @Input() objPath = '';
  @Input() formData: any = {};
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('profileImgInput') profileImgInput!: ElementRef;
  @Output() newItemEvent = new EventEmitter<number>();
  submitted = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.kycForm = this.fb.group({
      fileName: [this.formData.fileName || '', Validators.required],
      file: ['', Validators.required],
      profileImg: ['', Validators.required]
    });

    if (this.formData.file) {
      this.selectedFileName = this.formData.file;
      this.kycForm.patchValue({ file: this.formData.file });
      this.imagePreviewUrl = `${this.authService.cdnPath + this.formData.file}`;
    }

    if (this.formData.profileImg) {
      this.selectedProfileImgName = this.formData.profileImg;
      this.kycForm.patchValue({ profileImg: this.formData.profileImg });
      this.profileImgPreviewUrl = `${this.authService.cdnPath + this.formData.profileImg}`;
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && this.validateFileFormat(file)) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.kycForm.patchValue({ file: file.name });

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.kycForm.controls['file'].setErrors({ invalidFormat: true });
    }
  }

  onProfileImgSelect(event: any) {
    const file = event.target.files[0];
    if (file && this.validateFileFormat(file)) {
      this.profileImgFile = file;
      this.selectedProfileImgName = file.name;
      
      this.kycForm.patchValue({ profileImg: file.name });
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
  
        img.onload = () => {
          // Validate the image size (max 2MB)
          const maxSize = 2 * 1024 * 1024; // 2MB
          if (file.size > maxSize) {
            this.kycForm.controls['profileImg'].setErrors({ maxSizeExceeded: true });
            this.profileImgPreviewUrl = null;
          } else {
            // If no size error, set the preview URL
            this.profileImgPreviewUrl = reader.result as string;
          }
        };
      };
      reader.readAsDataURL(file);
    } else {
      this.kycForm.controls['profileImg'].setErrors({ invalidFormat: true });
    }
  }

  // Validate that the file is of a supported image format
  validateFileFormat(file: File): boolean {
    const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    return allowedFormats.includes(file.type);
  }
  

  onSubmit() {
    this.submitted = true;

    if (this.kycForm.valid) {
      const formData = new FormData();
      const currentValues = this.kycForm.value;

      if (currentValues.fileName !== this.formData.fileName) {
        formData.append('fileName', currentValues.fileName);
      }

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      } else if (currentValues.file !== this.formData.file) {
        formData.append('file', currentValues.file);
      }

      if (this.profileImgFile) {
        formData.append('profileImg', this.profileImgFile);
      } else if (currentValues.profileImg !== this.formData.profileImg) {
        formData.append('profileImg', currentValues.profileImg);
      }

      if (formData.has('fileName') || formData.has('file') || formData.has('profileImg')) {
        this.authService.post(this.objPath, formData).subscribe(
          (res: any) => {
            if (res) {
              this.communicationService.showNotification('snackbar-success', 'File Uploaded Successfully...', 'bottom', 'center');
              setTimeout(() => {
                this.navigateFun();
              },600)
            }
          },
          error => {
            this.communicationService.showNotification('snackbar-danger', error.error.message, 'bottom', 'center');
          }
        );
      } else {
        this.communicationService.showNotification('snackbar-info', 'No changes detected to submit.', 'bottom', 'center');
      }
    } else {
      this.communicationService.showNotification('snackbar-danger', 'Please complete the form before submitting.', 'bottom', 'center');
    }
  }

  navigateFun() {
    this.submitted = false;
    this.newItemEvent.emit(1);
  }
}
