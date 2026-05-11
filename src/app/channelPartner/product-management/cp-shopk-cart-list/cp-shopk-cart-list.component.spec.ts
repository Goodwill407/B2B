import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkCartListComponent } from './cp-shopk-cart-list.component';

describe('CpShopkCartListComponent', () => {
  let component: CpShopkCartListComponent;
  let fixture: ComponentFixture<CpShopkCartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkCartListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkCartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
