import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartProduct2RetailerComponent } from './cart-product2-retailer.component';

describe('CartProduct2RetailerComponent', () => {
  let component: CartProduct2RetailerComponent;
  let fixture: ComponentFixture<CartProduct2RetailerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartProduct2RetailerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartProduct2RetailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
