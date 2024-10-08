import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StepOneComponent } from './step-one/step-one.component';
import { StepTwoComponent } from './step-two/step-two.component';
import { StepThreeComponent } from './step-three/step-three.component';
import { CommonModule } from '@angular/common';
import { AuthService, CommunicationService } from '@core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Router } from '@angular/router';

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

  currentStep = 1;
  productId: string | null = null;

  constructor(
    private authService: AuthService,    
    private communicationService: CommunicationService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,     
    private router:Router) {   

    
    this.route.queryParamMap.subscribe(params => {
      this.productId = params.get('id');
    }); 

  }
 


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
