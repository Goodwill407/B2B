import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewMdeliveryChallanComponent } from './view-mdelivery-challan.component';

describe('ViewMdeliveryChallanComponent', () => {
  let component: ViewMdeliveryChallanComponent;
  let fixture: ComponentFixture<ViewMdeliveryChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewMdeliveryChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewMdeliveryChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
