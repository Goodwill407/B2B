import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpViewShopComponent } from './cp-view-shop.component';

describe('CpViewShopComponent', () => {
  let component: CpViewShopComponent;
  let fixture: ComponentFixture<CpViewShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpViewShopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpViewShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
