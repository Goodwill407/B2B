import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderedProductComponent } from './ordered-product.component';

describe('OrderedProductComponent', () => {
  let component: OrderedProductComponent;
  let fixture: ComponentFixture<OrderedProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderedProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderedProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
