import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhCreditNoteUsageViewComponent } from './ret-wh-credit-note-usage-view.component';

describe('RetWhCreditNoteUsageViewComponent', () => {
  let component: RetWhCreditNoteUsageViewComponent;
  let fixture: ComponentFixture<RetWhCreditNoteUsageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhCreditNoteUsageViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhCreditNoteUsageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
