import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhInvoiceViewComponent } from './ret-wh-invoice-view.component';

describe('RetWhInvoiceViewComponent', () => {
  let component: RetWhInvoiceViewComponent;
  let fixture: ComponentFixture<RetWhInvoiceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhInvoiceViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
