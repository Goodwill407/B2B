import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailerBulkInviteComponent } from './retailer-bulk-invite.component';

describe('RetailerBulkInviteComponent', () => {
  let component: RetailerBulkInviteComponent;
  let fixture: ComponentFixture<RetailerBulkInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailerBulkInviteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailerBulkInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
