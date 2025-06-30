import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGenWholsalerPoOrderComponent } from './edit-gen-wholsaler-po-order.component';

describe('EditGenWholsalerPoOrderComponent', () => {
  let component: EditGenWholsalerPoOrderComponent;
  let fixture: ComponentFixture<EditGenWholsalerPoOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditGenWholsalerPoOrderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditGenWholsalerPoOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
