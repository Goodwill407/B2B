import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufaturerList2Component } from './manufaturer-list2.component';

describe('ManufaturerList2Component', () => {
  let component: ManufaturerList2Component;
  let fixture: ComponentFixture<ManufaturerList2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufaturerList2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManufaturerList2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
