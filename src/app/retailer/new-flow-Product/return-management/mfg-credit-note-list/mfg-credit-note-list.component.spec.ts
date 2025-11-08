import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgCreditNoteListComponent } from './mfg-credit-note-list.component';

describe('MfgCreditNoteListComponent', () => {
  let component: MfgCreditNoteListComponent;
  let fixture: ComponentFixture<MfgCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
