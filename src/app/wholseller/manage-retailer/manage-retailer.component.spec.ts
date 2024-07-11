import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRetailerComponent } from './manage-retailer.component';

describe('ManageRetailerComponent', () => {
  let component: ManageRetailerComponent;
  let fixture: ComponentFixture<ManageRetailerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRetailerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageRetailerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
