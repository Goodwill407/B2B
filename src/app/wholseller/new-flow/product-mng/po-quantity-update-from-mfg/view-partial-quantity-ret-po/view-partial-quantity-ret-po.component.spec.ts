import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPartialQuantityRetPoComponent } from './view-partial-quantity-ret-po.component';

describe('ViewPartialQuantityRetPoComponent', () => {
  let component: ViewPartialQuantityRetPoComponent;
  let fixture: ComponentFixture<ViewPartialQuantityRetPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPartialQuantityRetPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPartialQuantityRetPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
