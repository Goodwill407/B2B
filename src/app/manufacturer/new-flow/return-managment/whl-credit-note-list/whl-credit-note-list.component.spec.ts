import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlCreditNoteListComponent } from './whl-credit-note-list.component';

describe('WhlCreditNoteListComponent', () => {
  let component: WhlCreditNoteListComponent;
  let fixture: ComponentFixture<WhlCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
