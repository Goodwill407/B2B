import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUpdatedWholsalerPoOrderComponent } from './view-updated-wholsaler-po-order.component';

describe('ViewUpdatedWholsalerPoOrderComponent', () => {
  let component: ViewUpdatedWholsalerPoOrderComponent;
  let fixture: ComponentFixture<ViewUpdatedWholsalerPoOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUpdatedWholsalerPoOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewUpdatedWholsalerPoOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
