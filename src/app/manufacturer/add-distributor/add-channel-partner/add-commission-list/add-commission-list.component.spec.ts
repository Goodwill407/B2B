import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommissionListComponent } from './add-commission-list.component';

describe('AddCommissionListComponent', () => {
  let component: AddCommissionListComponent;
  let fixture: ComponentFixture<AddCommissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommissionListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCommissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
