import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlInvoiceListComponent } from './whl-invoice-list.component';

describe('WhlInvoiceListComponent', () => {
  let component: WhlInvoiceListComponent;
  let fixture: ComponentFixture<WhlInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
