import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CDNMNGComponent } from './cdn-mng.component';

describe('CDNMNGComponent', () => {
  let component: CDNMNGComponent;
  let fixture: ComponentFixture<CDNMNGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CDNMNGComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CDNMNGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
