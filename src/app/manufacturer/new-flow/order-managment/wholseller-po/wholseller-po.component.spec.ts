import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WholsellerPoComponent } from './wholseller-po.component';

describe('WholsellerPoComponent', () => {
  let component: WholsellerPoComponent;
  let fixture: ComponentFixture<WholsellerPoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WholsellerPoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WholsellerPoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
