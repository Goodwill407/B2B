import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesalerDiscountComponent } from './wholesaler-discount.component';

describe('WholesalerDiscountComponent', () => {
  let component: WholesalerDiscountComponent;
  let fixture: ComponentFixture<WholesalerDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholesalerDiscountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholesalerDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
