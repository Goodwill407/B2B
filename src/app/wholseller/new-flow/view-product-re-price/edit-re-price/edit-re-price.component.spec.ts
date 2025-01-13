import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRePriceComponent } from './edit-re-price.component';

describe('EditRePriceComponent', () => {
  let component: EditRePriceComponent;
  let fixture: ComponentFixture<EditRePriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRePriceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditRePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
