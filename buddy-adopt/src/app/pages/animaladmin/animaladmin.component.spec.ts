import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimaladminComponent } from './animaladmin.component';

describe('AnimaladminComponent', () => {
  let component: AnimaladminComponent;
  let fixture: ComponentFixture<AnimaladminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimaladminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimaladminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
