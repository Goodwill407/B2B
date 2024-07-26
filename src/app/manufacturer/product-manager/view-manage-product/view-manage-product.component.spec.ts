import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewManageProductComponent } from './view-manage-product.component';

describe('ViewManageProductComponent', () => {
  let component: ViewManageProductComponent;
  let fixture: ComponentFixture<ViewManageProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewManageProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewManageProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
