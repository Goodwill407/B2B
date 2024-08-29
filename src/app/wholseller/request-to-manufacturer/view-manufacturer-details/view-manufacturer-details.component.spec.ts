import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewManufacturerDetailsComponent } from './view-manufacturer-details.component';

describe('ViewManufacturerDetailsComponent', () => {
  let component: ViewManufacturerDetailsComponent;
  let fixture: ComponentFixture<ViewManufacturerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewManufacturerDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewManufacturerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
