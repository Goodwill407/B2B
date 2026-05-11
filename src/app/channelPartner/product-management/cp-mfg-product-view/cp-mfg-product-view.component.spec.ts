import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpMfgProductViewComponent } from './cp-mfg-product-view.component';

describe('CpMfgProductViewComponent', () => {
  let component: CpMfgProductViewComponent;
  let fixture: ComponentFixture<CpMfgProductViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpMfgProductViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpMfgProductViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
