import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpMfgProductListComponent } from './cp-mfg-product-list.component';

describe('CpMfgProductListComponent', () => {
  let component: CpMfgProductListComponent;
  let fixture: ComponentFixture<CpMfgProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpMfgProductListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpMfgProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
