import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailorPoGenComponent } from './retailor-po-gen.component';

describe('RetailorPoGenComponent', () => {
  let component: RetailorPoGenComponent;
  let fixture: ComponentFixture<RetailorPoGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailorPoGenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailorPoGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
