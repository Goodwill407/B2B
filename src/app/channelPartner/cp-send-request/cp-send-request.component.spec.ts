import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpSendRequestComponent } from './cp-send-request.component';

describe('CpSendRequestComponent', () => {
  let component: CpSendRequestComponent;
  let fixture: ComponentFixture<CpSendRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpSendRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpSendRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
