import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListChannelPartnerComponent } from './list-channel-partner.component';

describe('ListChannelPartnerComponent', () => {
  let component: ListChannelPartnerComponent;
  let fixture: ComponentFixture<ListChannelPartnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListChannelPartnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListChannelPartnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
