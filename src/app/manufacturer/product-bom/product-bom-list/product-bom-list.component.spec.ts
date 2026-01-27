import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBomListComponent } from './product-bom-list.component';

describe('ProductBomListComponent', () => {
  let component: ProductBomListComponent;
  let fixture: ComponentFixture<ProductBomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBomListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductBomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
