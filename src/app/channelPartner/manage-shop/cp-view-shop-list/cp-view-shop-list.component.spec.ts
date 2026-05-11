import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpViewShopListComponent } from './cp-view-shop-list.component';

describe('CpViewShopListComponent', () => {
  let component: CpViewShopListComponent;
  let fixture: ComponentFixture<CpViewShopListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpViewShopListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpViewShopListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
