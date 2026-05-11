import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkMfgInvoiceListComponent } from './cp-shopk-mfg-invoice-list.component';

describe('CpShopkMfgInvoiceListComponent', () => {
  let component: CpShopkMfgInvoiceListComponent;
  let fixture: ComponentFixture<CpShopkMfgInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkMfgInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkMfgInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
