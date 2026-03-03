import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhCreditNoteViewComponent } from './ret-wh-credit-note-view.component';

describe('RetWhCreditNoteViewComponent', () => {
  let component: RetWhCreditNoteViewComponent;
  let fixture: ComponentFixture<RetWhCreditNoteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhCreditNoteViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhCreditNoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
