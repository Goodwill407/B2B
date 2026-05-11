import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpAddShopComponent } from './cp-add-shop.component';

describe('CpAddShopComponent', () => {
  let component: CpAddShopComponent;
  let fixture: ComponentFixture<CpAddShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpAddShopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpAddShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
