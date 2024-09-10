import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailersDetailsComponent } from './view-retailers-details.component';

describe('ViewRetailersDetailsComponent', () => {
  let component: ViewRetailersDetailsComponent;
  let fixture: ComponentFixture<ViewRetailersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailersDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
