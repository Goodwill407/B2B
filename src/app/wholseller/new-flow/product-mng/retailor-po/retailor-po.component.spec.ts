import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailorPoComponent } from './retailor-po.component';

describe('RetailorPoComponent', () => {
  let component: RetailorPoComponent;
  let fixture: ComponentFixture<RetailorPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailorPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailorPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
