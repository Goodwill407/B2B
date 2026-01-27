import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductBomComponent } from './add-product-bom.component';

describe('AddProductBomComponent', () => {
  let component: AddProductBomComponent;
  let fixture: ComponentFixture<AddProductBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductBomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddProductBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
