import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartProduct2Component } from './cart-product2.component';

describe('CartProduct2Component', () => {
  let component: CartProduct2Component;
  let fixture: ComponentFixture<CartProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CartProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
