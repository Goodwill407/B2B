import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnProductMfgListComponent } from './return-product-mfg-list.component';

describe('ReturnProductMfgListComponent', () => {
  let component: ReturnProductMfgListComponent;
  let fixture: ComponentFixture<ReturnProductMfgListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnProductMfgListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReturnProductMfgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
