import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholsalerOrderComponent } from './view-wholsaler-order.component';

describe('ViewWholsalerOrderComponent', () => {
  let component: ViewWholsalerOrderComponent;
  let fixture: ComponentFixture<ViewWholsalerOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholsalerOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholsalerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
