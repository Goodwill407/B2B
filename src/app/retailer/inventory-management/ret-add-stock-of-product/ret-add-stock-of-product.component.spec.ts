import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetAddStockOfProductComponent } from './ret-add-stock-of-product.component';

describe('RetAddStockOfProductComponent', () => {
  let component: RetAddStockOfProductComponent;
  let fixture: ComponentFixture<RetAddStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetAddStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetAddStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
