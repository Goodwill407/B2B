import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkInviteComponent } from './bulk-invite.component';

describe('BulkInviteComponent', () => {
  let component: BulkInviteComponent;
  let fixture: ComponentFixture<BulkInviteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkInviteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BulkInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
