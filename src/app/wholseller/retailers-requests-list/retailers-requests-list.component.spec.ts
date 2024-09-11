import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailersRequestsListComponent } from './retailers-requests-list.component';

describe('RetailersRequestsListComponent', () => {
  let component: RetailersRequestsListComponent;
  let fixture: ComponentFixture<RetailersRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailersRequestsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailersRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
