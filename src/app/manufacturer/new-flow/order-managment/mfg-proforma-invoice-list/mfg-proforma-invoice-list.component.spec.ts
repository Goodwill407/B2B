import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgProformaInvoiceListComponent } from './mfg-proforma-invoice-list.component';

describe('MfgProformaInvoiceListComponent', () => {
  let component: MfgProformaInvoiceListComponent;
  let fixture: ComponentFixture<MfgProformaInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgProformaInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgProformaInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
