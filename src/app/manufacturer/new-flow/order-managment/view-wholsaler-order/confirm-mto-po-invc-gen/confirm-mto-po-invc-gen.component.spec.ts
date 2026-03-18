import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmMtoPoInvcGenComponent } from './confirm-mto-po-invc-gen.component';

describe('ConfirmMtoPoInvcGenComponent', () => {
  let component: ConfirmMtoPoInvcGenComponent;
  let fixture: ComponentFixture<ConfirmMtoPoInvcGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmMtoPoInvcGenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmMtoPoInvcGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
