import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnOrderMfgViewComponent } from './return-order-mfg-view.component';

describe('ReturnOrderMfgViewComponent', () => {
  let component: ReturnOrderMfgViewComponent;
  let fixture: ComponentFixture<ReturnOrderMfgViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnOrderMfgViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnOrderMfgViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
