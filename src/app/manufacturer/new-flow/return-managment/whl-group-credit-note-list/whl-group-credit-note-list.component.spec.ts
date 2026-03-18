import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlGroupCreditNoteListComponent } from './whl-group-credit-note-list.component';

describe('WhlGroupCreditNoteListComponent', () => {
  let component: WhlGroupCreditNoteListComponent;
  let fixture: ComponentFixture<WhlGroupCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlGroupCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlGroupCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
