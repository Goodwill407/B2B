import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkChannelPartnerComponent } from './link-channel-partner.component';

describe('LinkChannelPartnerComponent', () => {
  let component: LinkChannelPartnerComponent;
  let fixture: ComponentFixture<LinkChannelPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkChannelPartnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinkChannelPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
