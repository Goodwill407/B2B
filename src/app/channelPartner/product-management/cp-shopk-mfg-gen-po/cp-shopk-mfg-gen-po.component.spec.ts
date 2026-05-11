import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkMfgGenPoComponent } from './cp-shopk-mfg-gen-po.component';

describe('CpShopkMfgGenPoComponent', () => {
  let component: CpShopkMfgGenPoComponent;
  let fixture: ComponentFixture<CpShopkMfgGenPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkMfgGenPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkMfgGenPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
