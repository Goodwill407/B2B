import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholesellerPendingOrderComponent } from './view-wholeseller-pending-order.component';

describe('ViewWholesellerPendingOrderComponent', () => {
  let component: ViewWholesellerPendingOrderComponent;
  let fixture: ComponentFixture<ViewWholesellerPendingOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholesellerPendingOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholesellerPendingOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
