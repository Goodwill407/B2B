import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistProductComponent } from './wishlist-product.component';

describe('WishlistProductComponent', () => {
  let component: WishlistProductComponent;
  let fixture: ComponentFixture<WishlistProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
