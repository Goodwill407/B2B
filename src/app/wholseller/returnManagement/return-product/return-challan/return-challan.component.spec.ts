import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnChallanComponent } from './return-challan.component';

describe('ReturnChallanComponent', () => {
  let component: ReturnChallanComponent;
  let fixture: ComponentFixture<ReturnChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
