import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DilogConfirmacionComponent } from './dilog-confirmacion.component';

describe('DilogConfirmacionComponent', () => {
  let component: DilogConfirmacionComponent;
  let fixture: ComponentFixture<DilogConfirmacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DilogConfirmacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DilogConfirmacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
