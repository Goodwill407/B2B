import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlReturnOrderViewComponent } from './whl-return-order-view.component';

describe('WhlReturnOrderViewComponent', () => {
  let component: WhlReturnOrderViewComponent;
  let fixture: ComponentFixture<WhlReturnOrderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlReturnOrderViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlReturnOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
