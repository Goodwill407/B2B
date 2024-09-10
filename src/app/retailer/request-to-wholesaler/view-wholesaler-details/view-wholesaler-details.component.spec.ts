import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholesalerDetailsComponent } from './view-wholesaler-details.component';

describe('ViewWholesalerDetailsComponent', () => {
  let component: ViewWholesalerDetailsComponent;
  let fixture: ComponentFixture<ViewWholesalerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholesalerDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholesalerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
