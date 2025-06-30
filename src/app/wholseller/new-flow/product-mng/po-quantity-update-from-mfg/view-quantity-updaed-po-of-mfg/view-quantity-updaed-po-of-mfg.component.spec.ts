import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewQuantityUpdaedPoOfMfgComponent } from './view-quantity-updaed-po-of-mfg.component';

describe('ViewQuantityUpdaedPoOfMfgComponent', () => {
  let component: ViewQuantityUpdaedPoOfMfgComponent;
  let fixture: ComponentFixture<ViewQuantityUpdaedPoOfMfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewQuantityUpdaedPoOfMfgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewQuantityUpdaedPoOfMfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
