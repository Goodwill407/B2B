import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWishlistproductComponent } from './view-wishlistproduct.component';

describe('ViewWishlistproductComponent', () => {
  let component: ViewWishlistproductComponent;
  let fixture: ComponentFixture<ViewWishlistproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWishlistproductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWishlistproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
