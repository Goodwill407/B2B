import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerToManPoListComponent } from './retailer-to-man-po-list.component';

describe('RetailerToManPoListComponent', () => {
  let component: RetailerToManPoListComponent;
  let fixture: ComponentFixture<RetailerToManPoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerToManPoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerToManPoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
