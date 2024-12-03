import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholeselerProductsComponent } from './wholeseler-products.component';

describe('WholeselerProductsComponent', () => {
  let component: WholeselerProductsComponent;
  let fixture: ComponentFixture<WholeselerProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholeselerProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholeselerProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
