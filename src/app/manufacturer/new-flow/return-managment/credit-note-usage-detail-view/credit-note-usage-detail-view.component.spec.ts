import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNoteUsageDetailViewComponent } from './credit-note-usage-detail-view.component';

describe('CreditNoteUsageDetailViewComponent', () => {
  let component: CreditNoteUsageDetailViewComponent;
  let fixture: ComponentFixture<CreditNoteUsageDetailViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditNoteUsageDetailViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreditNoteUsageDetailViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
