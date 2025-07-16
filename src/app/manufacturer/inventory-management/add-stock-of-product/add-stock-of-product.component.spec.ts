import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStockOfProductComponent } from './add-stock-of-product.component';

describe('AddStockOfProductComponent', () => {
  let component: AddStockOfProductComponent;
  let fixture: ComponentFixture<AddStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
