import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRetMfgPoPartialDelComponent } from './update-ret-mfg-po-partial-del.component';

describe('UpdateRetMfgPoPartialDelComponent', () => {
  let component: UpdateRetMfgPoPartialDelComponent;
  let fixture: ComponentFixture<UpdateRetMfgPoPartialDelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRetMfgPoPartialDelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateRetMfgPoPartialDelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
