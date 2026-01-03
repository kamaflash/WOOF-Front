import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsDynamicComponent } from './forms-dynamic.component';

describe('FormsDynamicComponent', () => {
  let component: FormsDynamicComponent;
  let fixture: ComponentFixture<FormsDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsDynamicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormsDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
