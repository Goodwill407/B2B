import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageModelComponent } from './landing-page-model.component';

describe('LandingPageModelComponent', () => {
  let component: LandingPageModelComponent;
  let fixture: ComponentFixture<LandingPageModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageModelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingPageModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
