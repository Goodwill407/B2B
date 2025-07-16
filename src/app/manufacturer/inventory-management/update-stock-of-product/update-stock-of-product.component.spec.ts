import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStockOfProductComponent } from './update-stock-of-product.component';

describe('UpdateStockOfProductComponent', () => {
  let component: UpdateStockOfProductComponent;
  let fixture: ComponentFixture<UpdateStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
