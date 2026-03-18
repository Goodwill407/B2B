import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgWhGroupCreditNoteListComponent } from './mfg-wh-group-credit-note-list.component';

describe('MfgWhGroupCreditNoteListComponent', () => {
  let component: MfgWhGroupCreditNoteListComponent;
  let fixture: ComponentFixture<MfgWhGroupCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgWhGroupCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgWhGroupCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
