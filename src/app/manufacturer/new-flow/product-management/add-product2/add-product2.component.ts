import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product2',
  standalone: true,
  imports: [
    StepOneComponent,
    StepTwoComponent,
    StepThreeComponent,
    CommonModule
  ],
  templateUrl: './add-product2.component.html',
  styleUrl: './add-product2.component.scss'
})
export class AddProduct2Component {

  currentStep = 2;
  productId: string | null = null;

  goToNextStep(productId?: string) {
    if (productId) {
      this.productId = productId; // Store the product ID
    }
    this.currentStep++;
  }

  goToPreviousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

}
