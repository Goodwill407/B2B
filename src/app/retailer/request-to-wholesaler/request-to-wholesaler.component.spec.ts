import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestToWholesalerComponent } from './request-to-wholesaler.component';

describe('RequestToWholesalerComponent', () => {
  let component: RequestToWholesalerComponent;
  let fixture: ComponentFixture<RequestToWholesalerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestToWholesalerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestToWholesalerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
