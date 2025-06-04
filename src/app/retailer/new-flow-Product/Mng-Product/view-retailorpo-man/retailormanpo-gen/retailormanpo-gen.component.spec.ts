import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailormanpoGenComponent } from './retailormanpo-gen.component';

describe('RetailormanpoGenComponent', () => {
  let component: RetailormanpoGenComponent;
  let fixture: ComponentFixture<RetailormanpoGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailormanpoGenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailormanpoGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
