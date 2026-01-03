import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SheltterComponent } from './sheltter.component';

describe('SheltterComponent', () => {
  let component: SheltterComponent;
  let fixture: ComponentFixture<SheltterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SheltterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SheltterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
