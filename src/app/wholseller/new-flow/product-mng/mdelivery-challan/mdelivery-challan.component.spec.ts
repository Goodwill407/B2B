import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdeliveryChallanComponent } from './mdelivery-challan.component';

describe('MdeliveryChallanComponent', () => {
  let component: MdeliveryChallanComponent;
  let fixture: ComponentFixture<MdeliveryChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MdeliveryChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MdeliveryChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
