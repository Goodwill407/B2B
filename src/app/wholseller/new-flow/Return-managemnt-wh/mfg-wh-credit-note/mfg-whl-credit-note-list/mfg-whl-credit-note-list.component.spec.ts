import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhlCreditNoteListComponent } from './mfg-whl-credit-note-list.component';

describe('MfgWhlCreditNoteListComponent', () => {
  let component: MfgWhlCreditNoteListComponent;
  let fixture: ComponentFixture<MfgWhlCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhlCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhlCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
