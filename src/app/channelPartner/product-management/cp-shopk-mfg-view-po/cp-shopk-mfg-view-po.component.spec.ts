import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkMfgViewPoComponent } from './cp-shopk-mfg-view-po.component';

describe('CpShopkMfgViewPoComponent', () => {
  let component: CpShopkMfgViewPoComponent;
  let fixture: ComponentFixture<CpShopkMfgViewPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkMfgViewPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkMfgViewPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
