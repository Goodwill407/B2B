import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhlCreditNoteViewComponent } from './mfg-whl-credit-note-view.component';

describe('MfgWhlCreditNoteViewComponent', () => {
  let component: MfgWhlCreditNoteViewComponent;
  let fixture: ComponentFixture<MfgWhlCreditNoteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhlCreditNoteViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhlCreditNoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
