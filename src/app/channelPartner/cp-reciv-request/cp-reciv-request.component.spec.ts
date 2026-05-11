import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpRecivRequestComponent } from './cp-reciv-request.component';

describe('CpRecivRequestComponent', () => {
  let component: CpRecivRequestComponent;
  let fixture: ComponentFixture<CpRecivRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpRecivRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpRecivRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
