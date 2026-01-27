import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProductBomComponent } from './view-product-bom.component';

describe('ViewProductBomComponent', () => {
  let component: ViewProductBomComponent;
  let fixture: ComponentFixture<ViewProductBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewProductBomComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewProductBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
