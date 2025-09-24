import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnOrderRetViewComponent } from './return-order-ret-view.component';

describe('ReturnOrderRetViewComponent', () => {
  let component: ReturnOrderRetViewComponent;
  let fixture: ComponentFixture<ReturnOrderRetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnOrderRetViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnOrderRetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
