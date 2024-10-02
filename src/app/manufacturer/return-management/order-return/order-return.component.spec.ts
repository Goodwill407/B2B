import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReturnComponent } from './order-return.component';

describe('OrderReturnComponent', () => {
  let component: OrderReturnComponent;
  let fixture: ComponentFixture<OrderReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
