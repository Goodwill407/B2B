import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPlaceOrderPoComponent } from './view-place-order-po.component';

describe('ViewPlaceOrderPoComponent', () => {
  let component: ViewPlaceOrderPoComponent;
  let fixture: ComponentFixture<ViewPlaceOrderPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPlaceOrderPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPlaceOrderPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
