import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetUpdateStockOfProductComponent } from './ret-update-stock-of-product.component';

describe('RetUpdateStockOfProductComponent', () => {
  let component: RetUpdateStockOfProductComponent;
  let fixture: ComponentFixture<RetUpdateStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetUpdateStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetUpdateStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
