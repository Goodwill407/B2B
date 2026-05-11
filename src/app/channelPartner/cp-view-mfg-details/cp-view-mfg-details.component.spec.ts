import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpViewMfgDetailsComponent } from './cp-view-mfg-details.component';

describe('CpViewMfgDetailsComponent', () => {
  let component: CpViewMfgDetailsComponent;
  let fixture: ComponentFixture<CpViewMfgDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpViewMfgDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpViewMfgDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
