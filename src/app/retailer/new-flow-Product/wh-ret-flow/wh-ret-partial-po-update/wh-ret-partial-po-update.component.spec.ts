import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhRetPartialPoUpdateComponent } from './wh-ret-partial-po-update.component';

describe('WhRetPartialPoUpdateComponent', () => {
  let component: WhRetPartialPoUpdateComponent;
  let fixture: ComponentFixture<WhRetPartialPoUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhRetPartialPoUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhRetPartialPoUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
