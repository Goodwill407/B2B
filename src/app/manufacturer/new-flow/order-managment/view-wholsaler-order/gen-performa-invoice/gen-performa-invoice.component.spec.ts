import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenPerformaInvoiceComponent } from './gen-performa-invoice.component';

describe('GenPerformaInvoiceComponent', () => {
  let component: GenPerformaInvoiceComponent;
  let fixture: ComponentFixture<GenPerformaInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenPerformaInvoiceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenPerformaInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
