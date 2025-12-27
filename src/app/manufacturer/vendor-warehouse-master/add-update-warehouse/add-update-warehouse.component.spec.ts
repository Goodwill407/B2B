import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateWarehouseComponent } from './add-update-warehouse.component';

describe('AddUpdateWarehouseComponent', () => {
  let component: AddUpdateWarehouseComponent;
  let fixture: ComponentFixture<AddUpdateWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUpdateWarehouseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddUpdateWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
