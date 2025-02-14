import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartProduct2RetailerManComponent } from './cart-product2-retailer-man.component';

describe('CartProduct2RetailerManComponent', () => {
  let component: CartProduct2RetailerManComponent;
  let fixture: ComponentFixture<CartProduct2RetailerManComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartProduct2RetailerManComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartProduct2RetailerManComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
