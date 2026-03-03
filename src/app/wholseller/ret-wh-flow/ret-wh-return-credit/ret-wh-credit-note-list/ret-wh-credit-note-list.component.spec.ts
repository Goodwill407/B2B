import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhCreditNoteListComponent } from './ret-wh-credit-note-list.component';

describe('RetWhCreditNoteListComponent', () => {
  let component: RetWhCreditNoteListComponent;
  let fixture: ComponentFixture<RetWhCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
