import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WolesellerPendingOrdersComponent } from './woleseller-pending-orders.component';

describe('WolesellerPendingOrdersComponent', () => {
  let component: WolesellerPendingOrdersComponent;
  let fixture: ComponentFixture<WolesellerPendingOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WolesellerPendingOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WolesellerPendingOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
