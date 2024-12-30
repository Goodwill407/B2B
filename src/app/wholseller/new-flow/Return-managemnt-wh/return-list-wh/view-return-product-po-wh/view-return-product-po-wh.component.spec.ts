import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReturnProductPoWhComponent } from './view-return-product-po-wh.component';

describe('ViewReturnProductPoWhComponent', () => {
  let component: ViewReturnProductPoWhComponent;
  let fixture: ComponentFixture<ViewReturnProductPoWhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReturnProductPoWhComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewReturnProductPoWhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
