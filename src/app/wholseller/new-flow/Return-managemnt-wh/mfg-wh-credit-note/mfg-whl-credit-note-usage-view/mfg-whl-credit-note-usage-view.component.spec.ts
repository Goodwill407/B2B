import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhlCreditNoteUsageViewComponent } from './mfg-whl-credit-note-usage-view.component';

describe('MfgWhlCreditNoteUsageViewComponent', () => {
  let component: MfgWhlCreditNoteUsageViewComponent;
  let fixture: ComponentFixture<MfgWhlCreditNoteUsageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhlCreditNoteUsageViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhlCreditNoteUsageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
