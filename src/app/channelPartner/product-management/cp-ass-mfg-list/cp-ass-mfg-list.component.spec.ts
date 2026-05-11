import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpAssMfgListComponent } from './cp-ass-mfg-list.component';

describe('CpAssMfgListComponent', () => {
  let component: CpAssMfgListComponent;
  let fixture: ComponentFixture<CpAssMfgListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpAssMfgListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CpAssMfgListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
