import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerGroupCreditNoteListComponent } from './retailer-group-credit-note-list.component';

describe('RetailerGroupCreditNoteListComponent', () => {
  let component: RetailerGroupCreditNoteListComponent;
  let fixture: ComponentFixture<RetailerGroupCreditNoteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerGroupCreditNoteListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerGroupCreditNoteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
