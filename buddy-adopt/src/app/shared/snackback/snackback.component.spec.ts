import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbackComponent } from './snackback.component';

describe('SnackbackComponent', () => {
  let component: SnackbackComponent;
  let fixture: ComponentFixture<SnackbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
