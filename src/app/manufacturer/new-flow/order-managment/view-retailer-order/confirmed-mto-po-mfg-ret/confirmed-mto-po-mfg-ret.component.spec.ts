import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmedMtoPoMfgRetComponent } from './confirmed-mto-po-mfg-ret.component';

describe('ConfirmedMtoPoMfgRetComponent', () => {
  let component: ConfirmedMtoPoMfgRetComponent;
  let fixture: ComponentFixture<ConfirmedMtoPoMfgRetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmedMtoPoMfgRetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmedMtoPoMfgRetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
