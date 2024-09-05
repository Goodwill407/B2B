import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomiseProfileComponent } from './customise-profile.component';

describe('CustomiseProfileComponent', () => {
  let component: CustomiseProfileComponent;
  let fixture: ComponentFixture<CustomiseProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomiseProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomiseProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
