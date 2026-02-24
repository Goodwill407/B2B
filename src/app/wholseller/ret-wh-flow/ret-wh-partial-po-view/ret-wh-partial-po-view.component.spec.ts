import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhPartialPoViewComponent } from './ret-wh-partial-po-view.component';

describe('RetWhPartialPoViewComponent', () => {
  let component: RetWhPartialPoViewComponent;
  let fixture: ComponentFixture<RetWhPartialPoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhPartialPoViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhPartialPoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
