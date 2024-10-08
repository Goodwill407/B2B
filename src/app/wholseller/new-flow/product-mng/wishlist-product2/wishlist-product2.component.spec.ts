import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistProduct2Component } from './wishlist-product2.component';

describe('WishlistProduct2Component', () => {
  let component: WishlistProduct2Component;
  let fixture: ComponentFixture<WishlistProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
