import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrunProductsComponent } from './retrun-products.component';

describe('RetrunProductsComponent', () => {
  let component: RetrunProductsComponent;
  let fixture: ComponentFixture<RetrunProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrunProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetrunProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
