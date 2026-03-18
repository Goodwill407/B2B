import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhlCreditNoteViewComponent } from './whl-credit-note-view.component';

describe('WhlCreditNoteViewComponent', () => {
  let component: WhlCreditNoteViewComponent;
  let fixture: ComponentFixture<WhlCreditNoteViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhlCreditNoteViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhlCreditNoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
