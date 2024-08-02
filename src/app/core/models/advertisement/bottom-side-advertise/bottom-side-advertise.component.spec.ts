import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSideAdvertiseComponent } from './bottom-side-advertise.component';

describe('BottomSideAdvertiseComponent', () => {
  let component: BottomSideAdvertiseComponent;
  let fixture: ComponentFixture<BottomSideAdvertiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSideAdvertiseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BottomSideAdvertiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
