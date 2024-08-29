import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestToManufacturerComponent } from './request-to-manufacturer.component';

describe('RequestToManufacturerComponent', () => {
  let component: RequestToManufacturerComponent;
  let fixture: ComponentFixture<RequestToManufacturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestToManufacturerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RequestToManufacturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
