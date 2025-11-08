import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgCreditNoteViewComponent } from './mfg-credit-note-view.component';

describe('MfgCreditNoteViewComponent', () => {
  let component: MfgCreditNoteViewComponent;
  let fixture: ComponentFixture<MfgCreditNoteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgCreditNoteViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgCreditNoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
