import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReturnProductPoComponent } from './view-return-product-po.component';

describe('ViewReturnProductPoComponent', () => {
  let component: ViewReturnProductPoComponent;
  let fixture: ComponentFixture<ViewReturnProductPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReturnProductPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewReturnProductPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
