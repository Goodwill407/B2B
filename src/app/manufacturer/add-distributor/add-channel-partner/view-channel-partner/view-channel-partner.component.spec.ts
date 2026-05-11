import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChannelPartnerComponent } from './view-channel-partner.component';

describe('ViewChannelPartnerComponent', () => {
  let component: ViewChannelPartnerComponent;
  let fixture: ComponentFixture<ViewChannelPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewChannelPartnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewChannelPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
