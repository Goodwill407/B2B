import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhAddStockOfProductComponent } from './wh-add-stock-of-product.component';

describe('WhAddStockOfProductComponent', () => {
  let component: WhAddStockOfProductComponent;
  let fixture: ComponentFixture<WhAddStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhAddStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhAddStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
