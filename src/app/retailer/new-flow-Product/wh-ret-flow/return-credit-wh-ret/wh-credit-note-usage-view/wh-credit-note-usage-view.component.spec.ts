import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhCreditNoteUsageViewComponent } from './wh-credit-note-usage-view.component';

describe('WhCreditNoteUsageViewComponent', () => {
  let component: WhCreditNoteUsageViewComponent;
  let fixture: ComponentFixture<WhCreditNoteUsageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhCreditNoteUsageViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhCreditNoteUsageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
