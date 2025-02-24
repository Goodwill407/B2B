import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailorManOrderReqComponent } from './view-retailor-man-order-req.component';

describe('ViewRetailorManOrderReqComponent', () => {
  let component: ViewRetailorManOrderReqComponent;
  let fixture: ComponentFixture<ViewRetailorManOrderReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailorManOrderReqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailorManOrderReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
