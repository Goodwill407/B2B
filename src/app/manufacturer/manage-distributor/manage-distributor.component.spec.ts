import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDistributorComponent } from './manage-distributor.component';

describe('ManageDistributorComponent', () => {
  let component: ManageDistributorComponent;
  let fixture: ComponentFixture<ManageDistributorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDistributorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageDistributorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
