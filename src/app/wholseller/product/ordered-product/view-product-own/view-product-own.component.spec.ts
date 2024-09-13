import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductOwnComponent } from './view-product-own.component';

describe('ViewProductOwnComponent', () => {
  let component: ViewProductOwnComponent;
  let fixture: ComponentFixture<ViewProductOwnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductOwnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProductOwnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
