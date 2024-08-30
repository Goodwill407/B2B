import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholselersRequestsComponent } from './wholselers-requests.component';

describe('WholselersRequestsComponent', () => {
  let component: WholselersRequestsComponent;
  let fixture: ComponentFixture<WholselersRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholselersRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholselersRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
