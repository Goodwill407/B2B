import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhCreditNoteGroupListComponent } from './ret-wh-credit-note-group-list.component';

describe('RetWhCreditNoteGroupListComponent', () => {
  let component: RetWhCreditNoteGroupListComponent;
  let fixture: ComponentFixture<RetWhCreditNoteGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhCreditNoteGroupListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhCreditNoteGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
