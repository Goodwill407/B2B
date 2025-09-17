import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReturnProductMfgComponent } from './add-return-product-mfg.component';

describe('AddReturnProductMfgComponent', () => {
  let component: AddReturnProductMfgComponent;
  let fixture: ComponentFixture<AddReturnProductMfgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReturnProductMfgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddReturnProductMfgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
