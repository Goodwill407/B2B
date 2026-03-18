import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhlInvoiceListComponent } from './mfg-whl-invoice-list.component';

describe('MfgWhlInvoiceListComponent', () => {
  let component: MfgWhlInvoiceListComponent;
  let fixture: ComponentFixture<MfgWhlInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhlInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhlInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
