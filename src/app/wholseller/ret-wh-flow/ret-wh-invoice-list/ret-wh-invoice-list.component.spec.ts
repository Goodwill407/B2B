import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhInvoiceListComponent } from './ret-wh-invoice-list.component';

describe('RetWhInvoiceListComponent', () => {
  let component: RetWhInvoiceListComponent;
  let fixture: ComponentFixture<RetWhInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhInvoiceListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
