import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideAdvertiseComponent } from './right-side-advertise.component';

describe('RightSideAdvertiseComponent', () => {
  let component: RightSideAdvertiseComponent;
  let fixture: ComponentFixture<RightSideAdvertiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightSideAdvertiseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RightSideAdvertiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
