import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailorManOrderReqComponent } from './retailor-man-order-req.component';

describe('RetailorManOrderReqComponent', () => {
  let component: RetailorManOrderReqComponent;
  let fixture: ComponentFixture<RetailorManOrderReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailorManOrderReqComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailorManOrderReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
