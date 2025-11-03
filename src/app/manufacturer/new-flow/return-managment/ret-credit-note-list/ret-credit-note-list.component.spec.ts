import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetCreditNoteListComponent } from './ret-credit-note-list.component';

describe('RetCreditNoteListComponent', () => {
  let component: RetCreditNoteListComponent;
  let fixture: ComponentFixture<RetCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
