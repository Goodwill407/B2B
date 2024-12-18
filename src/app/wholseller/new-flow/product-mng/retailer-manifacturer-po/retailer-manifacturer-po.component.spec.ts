import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerManifacturerPoComponent } from './retailer-manifacturer-po.component';

describe('RetailerManifacturerPoComponent', () => {
  let component: RetailerManifacturerPoComponent;
  let fixture: ComponentFixture<RetailerManifacturerPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerManifacturerPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerManifacturerPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
