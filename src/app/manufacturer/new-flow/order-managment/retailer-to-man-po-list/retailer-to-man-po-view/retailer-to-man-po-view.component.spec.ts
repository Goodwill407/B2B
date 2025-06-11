import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerToManPoViewComponent } from './retailer-to-man-po-view.component';

describe('RetailerToManPoViewComponent', () => {
  let component: RetailerToManPoViewComponent;
  let fixture: ComponentFixture<RetailerToManPoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerToManPoViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerToManPoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
