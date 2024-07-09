import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstLandingPageComponent } from './first-landing-page.component';

describe('FirstLandingPageComponent', () => {
  let component: FirstLandingPageComponent;
  let fixture: ComponentFixture<FirstLandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstLandingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FirstLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
