import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnListWhComponent } from './return-list-wh.component';

describe('ReturnListWhComponent', () => {
  let component: ReturnListWhComponent;
  let fixture: ComponentFixture<ReturnListWhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnListWhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnListWhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
