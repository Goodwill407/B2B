import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReProductPriceComponent } from './edit-re-product-price.component';

describe('EditReProductPriceComponent', () => {
  let component: EditReProductPriceComponent;
  let fixture: ComponentFixture<EditReProductPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReProductPriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditReProductPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
