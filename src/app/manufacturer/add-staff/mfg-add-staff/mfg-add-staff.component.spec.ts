import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfgAddStaffComponent } from './mfg-add-staff.component';

describe('MfgAddStaffComponent', () => {
  let component: MfgAddStaffComponent;
  let fixture: ComponentFixture<MfgAddStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfgAddStaffComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfgAddStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
