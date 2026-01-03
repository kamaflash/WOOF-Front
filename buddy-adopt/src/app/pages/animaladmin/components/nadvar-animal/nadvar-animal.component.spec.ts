import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NadvarAnimalComponent } from './nadvar-animal.component';

describe('NadvarAnimalComponent', () => {
  let component: NadvarAnimalComponent;
  let fixture: ComponentFixture<NadvarAnimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NadvarAnimalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NadvarAnimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
