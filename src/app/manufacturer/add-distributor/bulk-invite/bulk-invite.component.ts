import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommunicationService } from '@core';
import { json } from 'd3';

@Component({
  selector: 'app-bulk-invite',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgFor, NgIf,
    RouterModule
  ],
  templateUrl: './bulk-invite.component.html',
  styleUrls: ['./bulk-invite.component.scss']
})
export class BulkInviteSingleComponent {
  inviteForm!: FormGroup;
  isSubmitted: boolean = false;

  constructor(private fb: FormBuilder, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.inviteForm = this.fb.group({
      distributors: this.fb.array([this.createDistributorFormGroup()])
    });
  }

  get distributors(): FormArray {
    return this.inviteForm.get('distributors') as FormArray;
  }

  createDistributorFormGroup(): FormGroup {
    return this.fb.group({
      distributorName: ['', Validators.required],
      companyName: [''],
      mobileCountryCode: ['', Validators.required],
      mobileNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  addDistributor(): void {
    this.distributors.push(this.createDistributorFormGroup());
  }

  removeDistributor(index: number): void {
    if (this.distributors.length > 1) {
      this.distributors.removeAt(index);
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.inviteForm.invalid) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    else {
      this.communicationService.showNotification('snackbar-success', 'Invitation Sent Successfully', 'bottom', 'center');
      alert(this.inviteForm.value.toString());
      this.isSubmitted = false;
      this.inviteForm.reset();
    }
    console.log(this.inviteForm.value);
  }

  getErrorMessage(controlName: string, index: number): string {
    const control = this.distributors.at(index).get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.replace(/([A-Z])/g, ' $1')} is required.`;
    } else if (control?.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    return '';
  }
}
