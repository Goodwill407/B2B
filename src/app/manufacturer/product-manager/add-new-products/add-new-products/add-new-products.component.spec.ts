import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProductsComponent } from './add-new-products.component';

describe('AddNewProductsComponent', () => {
  let component: AddNewProductsComponent;
  let fixture: ComponentFixture<AddNewProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
