import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenDlvChallanComponent } from './gen-dlv-challan.component';

describe('GenDlvChallanComponent', () => {
  let component: GenDlvChallanComponent;
  let fixture: ComponentFixture<GenDlvChallanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenDlvChallanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenDlvChallanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
