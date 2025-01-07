import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDeliveryFinalComponent } from './view-delivery-final.component';

describe('ViewDeliveryFinalComponent', () => {
  let component: ViewDeliveryFinalComponent;
  let fixture: ComponentFixture<ViewDeliveryFinalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDeliveryFinalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDeliveryFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
