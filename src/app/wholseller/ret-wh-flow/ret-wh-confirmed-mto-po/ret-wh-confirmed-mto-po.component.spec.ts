import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhConfirmedMtoPoComponent } from './ret-wh-confirmed-mto-po.component';

describe('RetWhConfirmedMtoPoComponent', () => {
  let component: RetWhConfirmedMtoPoComponent;
  let fixture: ComponentFixture<RetWhConfirmedMtoPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhConfirmedMtoPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhConfirmedMtoPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
