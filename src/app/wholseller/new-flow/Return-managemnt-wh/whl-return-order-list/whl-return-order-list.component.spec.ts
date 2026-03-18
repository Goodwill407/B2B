import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlReturnOrderListComponent } from './whl-return-order-list.component';

describe('WhlReturnOrderListComponent', () => {
  let component: WhlReturnOrderListComponent;
  let fixture: ComponentFixture<WhlReturnOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlReturnOrderListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlReturnOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
