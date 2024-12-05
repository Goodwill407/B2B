import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailWishlistComponent } from './view-detail-wishlist.component';

describe('ViewDetailWishlistComponent', () => {
  let component: ViewDetailWishlistComponent;
  let fixture: ComponentFixture<ViewDetailWishlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDetailWishlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDetailWishlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
