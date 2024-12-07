import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailerpoComponent } from './view-retailerpo.component';

describe('ViewRetailerpoComponent', () => {
  let component: ViewRetailerpoComponent;
  let fixture: ComponentFixture<ViewRetailerpoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailerpoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailerpoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
