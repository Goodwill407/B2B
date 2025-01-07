import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViwFinalProductPoWhComponent } from './viw-final-product-po-wh.component';

describe('ViwFinalProductPoWhComponent', () => {
  let component: ViwFinalProductPoWhComponent;
  let fixture: ComponentFixture<ViwFinalProductPoWhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViwFinalProductPoWhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViwFinalProductPoWhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
