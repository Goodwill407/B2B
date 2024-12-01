import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenratepoComponent } from './genratepo.component';

describe('GenratepoComponent', () => {
  let component: GenratepoComponent;
  let fixture: ComponentFixture<GenratepoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenratepoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenratepoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
