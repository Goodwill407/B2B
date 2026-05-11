import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkMfgCartListComponent } from './cp-shopk-mfg-cart-list.component';

describe('CpShopkMfgCartListComponent', () => {
  let component: CpShopkMfgCartListComponent;
  let fixture: ComponentFixture<CpShopkMfgCartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkMfgCartListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkMfgCartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
