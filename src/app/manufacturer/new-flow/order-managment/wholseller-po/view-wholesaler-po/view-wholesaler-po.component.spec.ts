import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholesalerPoComponent } from './view-wholesaler-po.component';

describe('ViewWholesalerPoComponent', () => {
  let component: ViewWholesalerPoComponent;
  let fixture: ComponentFixture<ViewWholesalerPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholesalerPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholesalerPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
