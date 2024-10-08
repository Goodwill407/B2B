import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProduct2Component } from './view-product2.component';

describe('ViewProduct2Component', () => {
  let component: ViewProduct2Component;
  let fixture: ComponentFixture<ViewProduct2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProduct2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProduct2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
