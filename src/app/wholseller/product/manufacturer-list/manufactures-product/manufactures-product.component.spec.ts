import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturesProductComponent } from './manufactures-product.component';

describe('ManufacturesProductComponent', () => {
  let component: ManufacturesProductComponent;
  let fixture: ComponentFixture<ManufacturesProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturesProductComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManufacturesProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
