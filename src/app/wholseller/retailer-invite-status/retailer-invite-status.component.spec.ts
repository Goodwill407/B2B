import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerInviteStatusComponent } from './retailer-invite-status.component';

describe('RetailerInviteStatusComponent', () => {
  let component: RetailerInviteStatusComponent;
  let fixture: ComponentFixture<RetailerInviteStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerInviteStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerInviteStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
