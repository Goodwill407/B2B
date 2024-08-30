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
    profileImgFile: File | null = null; // New field for profile image
    imagePreviewUrl: string | null = null;
    profileImgPreviewUrl: string | null = null; // Preview for profile image
    selectedFileName: string | null = null;
    selectedProfileImgName: string | null = null; // New field for profile image name
    @Input() objPath = '';
    @Input() formData: any = {};
    @ViewChild('fileInput') fileInput!: ElementRef;
    @ViewChild('profileImgInput') profileImgInput!: ElementRef; // New ViewChild for profile image input
    @Output() newItemEvent = new EventEmitter<number>();
    submitted = false;

    constructor(private fb: FormBuilder, private authService: AuthService, private communicationService: CommunicationService) { }

    ngOnInit(): void {
      this.kycForm = this.fb.group({
        fileName: [this.formData.fileName || '', Validators.required],
        file: ['', Validators.required],
        profileImg: ['', Validators.required] // New profileImg field with validation
      });

      // Pre-populate the form if file data exists
      if (this.formData.file) {
        this.selectedFileName = this.formData.file;
        this.kycForm.patchValue({ file: this.formData.file });
        this.imagePreviewUrl = `${this.authService.cdnPath + this.formData.file}`;
      }

      // Pre-populate the form if profileImg data exists
      if (this.formData.profileImg) {
        this.selectedProfileImgName = this.formData.profileImg;
        this.kycForm.patchValue({ profileImg: this.formData.profileImg });
        this.profileImgPreviewUrl = `${this.authService.cdnPath + this.formData.profileImg}`;
      }
    }

    onFileSelect(event: any) {
      this.selectedFile = event.target.files[0];

      if (this.selectedFile) {
        this.selectedFileName = this.selectedFile.name;
        this.kycForm.patchValue({ file: this.selectedFile.name });

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

    onProfileImgSelect(event: any) {
      this.profileImgFile = event.target.files[0];

      if (this.profileImgFile) {
        this.selectedProfileImgName = this.profileImgFile.name;
        this.kycForm.patchValue({ profileImg: this.profileImgFile.name });

        if (this.profileImgFile.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = () => {
            this.profileImgPreviewUrl = reader.result as string;
          };
          reader.readAsDataURL(this.profileImgFile);
        } else {
          this.profileImgPreviewUrl = null;
        }

        // Validate the image size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (this.profileImgFile.size > maxSize) {
          this.kycForm.controls['profileImg'].setErrors({ maxSizeExceeded: true });
          this.profileImgPreviewUrl = null; // Clear the preview if the size is too large
        }
      }
    }

    onSubmit() {
      this.submitted = true;
    
      if (this.kycForm.valid) {
        const formData = new FormData();
        const currentValues = this.kycForm.value;
        
        // Append only modified fields to the formData
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
