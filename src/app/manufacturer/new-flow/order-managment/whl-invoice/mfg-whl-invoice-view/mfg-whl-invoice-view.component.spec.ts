import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhlInvoiceViewComponent } from './mfg-whl-invoice-view.component';

describe('MfgWhlInvoiceViewComponent', () => {
  let component: MfgWhlInvoiceViewComponent;
  let fixture: ComponentFixture<MfgWhlInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhlInvoiceViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhlInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
