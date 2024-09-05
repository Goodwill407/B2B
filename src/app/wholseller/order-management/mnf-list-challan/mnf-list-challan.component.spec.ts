import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MnfListChallanComponent } from './mnf-list-challan.component';

describe('MnfListChallanComponent', () => {
  let component: MnfListChallanComponent;
  let fixture: ComponentFixture<MnfListChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MnfListChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MnfListChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
