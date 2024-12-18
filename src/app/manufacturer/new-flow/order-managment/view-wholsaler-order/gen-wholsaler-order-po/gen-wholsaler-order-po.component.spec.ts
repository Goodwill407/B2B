import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenWholsalerOrderPoComponent } from './gen-wholsaler-order-po.component';

describe('GenWholsalerOrderPoComponent', () => {
  let component: GenWholsalerOrderPoComponent;
  let fixture: ComponentFixture<GenWholsalerOrderPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenWholsalerOrderPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenWholsalerOrderPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
