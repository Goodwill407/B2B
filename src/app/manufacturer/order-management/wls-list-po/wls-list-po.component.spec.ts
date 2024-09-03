import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WlsListPoComponent } from './wls-list-po.component';

describe('WlsListPoComponent', () => {
  let component: WlsListPoComponent;
  let fixture: ComponentFixture<WlsListPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WlsListPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WlsListPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
