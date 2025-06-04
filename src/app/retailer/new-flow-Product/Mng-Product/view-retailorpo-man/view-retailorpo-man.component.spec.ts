import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailorpoManComponent } from './view-retailorpo-man.component';

describe('ViewRetailorpoManComponent', () => {
  let component: ViewRetailorpoManComponent;
  let fixture: ComponentFixture<ViewRetailorpoManComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailorpoManComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailorpoManComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
