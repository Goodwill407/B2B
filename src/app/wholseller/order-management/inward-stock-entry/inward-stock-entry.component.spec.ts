import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InwardStockEntryComponent } from './inward-stock-entry.component';

describe('InwardStockEntryComponent', () => {
  let component: InwardStockEntryComponent;
  let fixture: ComponentFixture<InwardStockEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InwardStockEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InwardStockEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
