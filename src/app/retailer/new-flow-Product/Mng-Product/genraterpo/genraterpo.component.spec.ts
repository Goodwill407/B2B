import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenraterpoComponent } from './genraterpo.component';

describe('GenraterpoComponent', () => {
  let component: GenraterpoComponent;
  let fixture: ComponentFixture<GenraterpoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenraterpoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenraterpoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
