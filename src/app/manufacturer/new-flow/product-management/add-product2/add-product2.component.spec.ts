import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduct2Component } from './add-product2.component';

describe('AddProduct2Component', () => {
  let component: AddProduct2Component;
  let fixture: ComponentFixture<AddProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
