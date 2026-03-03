import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhInvoiceListReturnComponent } from './wh-invoice-list-return.component';

describe('WhInvoiceListReturnComponent', () => {
  let component: WhInvoiceListReturnComponent;
  let fixture: ComponentFixture<WhInvoiceListReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhInvoiceListReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhInvoiceListReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
