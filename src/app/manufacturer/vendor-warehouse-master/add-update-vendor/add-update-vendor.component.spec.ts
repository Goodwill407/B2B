import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateVendorComponent } from './add-update-vendor.component';

describe('AddUpdateVendorComponent', () => {
  let component: AddUpdateVendorComponent;
  let fixture: ComponentFixture<AddUpdateVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateVendorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
