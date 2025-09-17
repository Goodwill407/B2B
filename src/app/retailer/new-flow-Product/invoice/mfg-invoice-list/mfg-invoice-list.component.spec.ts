import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgInvoiceListComponent } from './mfg-invoice-list.component';

describe('MfgInvoiceListComponent', () => {
  let component: MfgInvoiceListComponent;
  let fixture: ComponentFixture<MfgInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
