import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequesviewComponent } from './requesview.component';

describe('RequesviewComponent', () => {
  let component: RequesviewComponent;
  let fixture: ComponentFixture<RequesviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequesviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequesviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
