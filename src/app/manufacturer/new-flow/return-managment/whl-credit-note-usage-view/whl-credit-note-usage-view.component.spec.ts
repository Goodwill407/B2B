import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlCreditNoteUsageViewComponent } from './whl-credit-note-usage-view.component';

describe('WhlCreditNoteUsageViewComponent', () => {
  let component: WhlCreditNoteUsageViewComponent;
  let fixture: ComponentFixture<WhlCreditNoteUsageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlCreditNoteUsageViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlCreditNoteUsageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
