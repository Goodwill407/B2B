import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgInvoiceListReturnComponent } from './mfg-invoice-list-return.component';

describe('MfgInvoiceListReturnComponent', () => {
  let component: MfgInvoiceListReturnComponent;
  let fixture: ComponentFixture<MfgInvoiceListReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgInvoiceListReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgInvoiceListReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
