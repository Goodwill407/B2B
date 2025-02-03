import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductViewOfMfgComponent } from './product-view-of-mfg.component';

describe('ProductViewOfMfgComponent', () => {
  let component: ProductViewOfMfgComponent;
  let fixture: ComponentFixture<ProductViewOfMfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductViewOfMfgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductViewOfMfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
