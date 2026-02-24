import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetWhPoListComponent } from './ret-wh-po-list.component';

describe('RetWhPoListComponent', () => {
  let component: RetWhPoListComponent;
  let fixture: ComponentFixture<RetWhPoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetWhPoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetWhPoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
