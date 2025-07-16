import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhUpdateStockOfProductComponent } from './wh-update-stock-of-product.component';

describe('WhUpdateStockOfProductComponent', () => {
  let component: WhUpdateStockOfProductComponent;
  let fixture: ComponentFixture<WhUpdateStockOfProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhUpdateStockOfProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WhUpdateStockOfProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
