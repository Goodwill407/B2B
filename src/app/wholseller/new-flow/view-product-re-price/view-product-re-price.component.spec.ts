import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductRePriceComponent } from './view-product-re-price.component';

describe('ViewProductRePriceComponent', () => {
  let component: ViewProductRePriceComponent;
  let fixture: ComponentFixture<ViewProductRePriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductRePriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProductRePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
