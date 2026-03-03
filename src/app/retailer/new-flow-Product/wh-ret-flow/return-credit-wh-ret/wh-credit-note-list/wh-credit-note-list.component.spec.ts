import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhCreditNoteListComponent } from './wh-credit-note-list.component';

describe('WhCreditNoteListComponent', () => {
  let component: WhCreditNoteListComponent;
  let fixture: ComponentFixture<WhCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
