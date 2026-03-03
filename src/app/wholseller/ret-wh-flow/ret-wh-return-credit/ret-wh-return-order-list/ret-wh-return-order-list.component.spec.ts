import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhReturnOrderListComponent } from './ret-wh-return-order-list.component';

describe('RetWhReturnOrderListComponent', () => {
  let component: RetWhReturnOrderListComponent;
  let fixture: ComponentFixture<RetWhReturnOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhReturnOrderListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhReturnOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
