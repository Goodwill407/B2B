import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhReturnOrderViewComponent } from './ret-wh-return-order-view.component';

describe('RetWhReturnOrderViewComponent', () => {
  let component: RetWhReturnOrderViewComponent;
  let fixture: ComponentFixture<RetWhReturnOrderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhReturnOrderViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhReturnOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
