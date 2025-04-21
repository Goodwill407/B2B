import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgProformaInvoiceViewComponent } from './mfg-proforma-invoice-view.component';

describe('MfgProformaInvoiceViewComponent', () => {
  let component: MfgProformaInvoiceViewComponent;
  let fixture: ComponentFixture<MfgProformaInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgProformaInvoiceViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgProformaInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
