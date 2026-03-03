import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhGroupCreditNoteListComponent } from './wh-group-credit-note-list.component';

describe('WhGroupCreditNoteListComponent', () => {
  let component: WhGroupCreditNoteListComponent;
  let fixture: ComponentFixture<WhGroupCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhGroupCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhGroupCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
