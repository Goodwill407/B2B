import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedRequestsListComponent } from './rejected-requests-list.component';

describe('RejectedRequestsListComponent', () => {
  let component: RejectedRequestsListComponent;
  let fixture: ComponentFixture<RejectedRequestsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedRequestsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectedRequestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
