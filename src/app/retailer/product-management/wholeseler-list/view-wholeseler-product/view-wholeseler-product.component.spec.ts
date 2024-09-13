import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholeselerProductComponent } from './view-wholeseler-product.component';

describe('ViewWholeselerProductComponent', () => {
  let component: ViewWholeselerProductComponent;
  let fixture: ComponentFixture<ViewWholeselerProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholeselerProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholeselerProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
