import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpBrokerRequestsComponent } from './cp-broker-requests.component';

describe('CpBrokerRequestsComponent', () => {
  let component: CpBrokerRequestsComponent;
  let fixture: ComponentFixture<CpBrokerRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpBrokerRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpBrokerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
