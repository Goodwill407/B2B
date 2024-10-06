import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProduct2Component } from './add-new-product2.component';

describe('AddNewProduct2Component', () => {
  let component: AddNewProduct2Component;
  let fixture: ComponentFixture<AddNewProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddNewProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
