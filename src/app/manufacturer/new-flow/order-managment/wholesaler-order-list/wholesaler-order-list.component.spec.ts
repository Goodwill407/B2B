import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholesalerOrderListComponent } from './wholesaler-order-list.component';

describe('WholesalerOrderListComponent', () => {
  let component: WholesalerOrderListComponent;
  let fixture: ComponentFixture<WholesalerOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholesalerOrderListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholesalerOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
