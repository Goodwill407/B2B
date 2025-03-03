import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewForwardedComponent } from './view-forwarded.component';

describe('ViewForwardedComponent', () => {
  let component: ViewForwardedComponent;
  let fixture: ComponentFixture<ViewForwardedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewForwardedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewForwardedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
