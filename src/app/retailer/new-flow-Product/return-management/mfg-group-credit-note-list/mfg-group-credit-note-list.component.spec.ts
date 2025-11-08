import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgGroupCreditNoteListComponent } from './mfg-group-credit-note-list.component';

describe('MfgGroupCreditNoteListComponent', () => {
  let component: MfgGroupCreditNoteListComponent;
  let fixture: ComponentFixture<MfgGroupCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgGroupCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgGroupCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
