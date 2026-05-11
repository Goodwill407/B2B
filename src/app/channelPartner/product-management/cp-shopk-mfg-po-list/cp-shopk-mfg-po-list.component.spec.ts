import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpShopkMfgPoListComponent } from './cp-shopk-mfg-po-list.component';

describe('CpShopkMfgPoListComponent', () => {
  let component: CpShopkMfgPoListComponent;
  let fixture: ComponentFixture<CpShopkMfgPoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpShopkMfgPoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpShopkMfgPoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
