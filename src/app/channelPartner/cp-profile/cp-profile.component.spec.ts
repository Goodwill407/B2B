import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpProfileComponent } from './cp-profile.component';

describe('CpProfileComponent', () => {
  let component: CpProfileComponent;
  let fixture: ComponentFixture<CpProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
