import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkInviteSingleComponent } from './bulk-invite.component';

describe('BulkInviteComponent', () => {
  let component: BulkInviteSingleComponent;
  let fixture: ComponentFixture<BulkInviteSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkInviteSingleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkInviteSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
