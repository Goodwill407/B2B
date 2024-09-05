import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChallanComponent } from './view-challan.component';

describe('ViewChallanComponent', () => {
  let component: ViewChallanComponent;
  let fixture: ComponentFixture<ViewChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
