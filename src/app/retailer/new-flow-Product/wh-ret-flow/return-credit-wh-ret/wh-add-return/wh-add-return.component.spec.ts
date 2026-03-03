import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhAddReturnComponent } from './wh-add-return.component';

describe('WhAddReturnComponent', () => {
  let component: WhAddReturnComponent;
  let fixture: ComponentFixture<WhAddReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhAddReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhAddReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
