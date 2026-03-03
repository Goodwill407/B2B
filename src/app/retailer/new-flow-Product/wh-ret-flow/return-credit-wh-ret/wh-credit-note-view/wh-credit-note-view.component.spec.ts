import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhCreditNoteViewComponent } from './wh-credit-note-view.component';

describe('WhCreditNoteViewComponent', () => {
  let component: WhCreditNoteViewComponent;
  let fixture: ComponentFixture<WhCreditNoteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhCreditNoteViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhCreditNoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
