import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '@core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';

@Component({
  selector: 'app-landing-page-model',
  standalone: true,
  imports: [ BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatOptionModule,
    FileUploadComponent,
    MatButtonModule,
    MatIconModule,],
  templateUrl: './landing-page-model.component.html',
  styleUrl: './landing-page-model.component.scss'
})
export class LandingPageModelComponent {
  teacherApplyForm:any=UntypedFormGroup;
  submitted:boolean=false;
  // breadscrums = [
  //   {
  //     title: 'Add Course',
  //     items: ['Course'],
  //     active: 'Add Course',
  //   },
  // ];
  constructor(private fb: UntypedFormBuilder, private auth:AuthService,public dialogRef: MatDialogRef<LandingPageModelComponent>) {
    
  }
  ngOnInit(): void {
    this.teacherApplyForm = this.fb.group({
      name: ['', Validators.required],
      caste: [''],
      gender: ['', Validators.required],
      age: ['', Validators.required],
      mobNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      pinCode: ['', Validators.required],
      address: ['', Validators.required],
      reservationDetails: ['', Validators.required],
      marks: ['', Validators.required],
      qualification: ['', Validators.required],
      yearOfPassing: ['', Validators.required],
      univercityName: ['', Validators.required],
      persentage: ['', Validators.required],
      subject: ['', Validators.required],
      collegeName: ['', Validators.required],
      profssionalQualification:['', Validators.required],
    });
  }

  onSubmit() {
    this.submitted=true
   if(this.teacherApplyForm.invalid){
    return
   }
   else{
    this.saveData()
   }
}

saveData(){
  this.auth.post('teacher',this.teacherApplyForm.value).subscribe((res:any)=>{
    alert("successfully submitted")
  })
}
}

