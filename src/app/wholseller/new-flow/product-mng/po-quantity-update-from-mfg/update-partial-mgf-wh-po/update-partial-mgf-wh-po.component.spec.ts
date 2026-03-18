import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePartialMgfWhPoComponent } from './update-partial-mgf-wh-po.component';

describe('UpdatePartialMgfWhPoComponent', () => {
  let component: UpdatePartialMgfWhPoComponent;
  let fixture: ComponentFixture<UpdatePartialMgfWhPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePartialMgfWhPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdatePartialMgfWhPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
