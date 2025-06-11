import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailerOrderComponent } from './view-retailer-order.component';

describe('ViewRetailerOrderComponent', () => {
  let component: ViewRetailerOrderComponent;
  let fixture: ComponentFixture<ViewRetailerOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailerOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
