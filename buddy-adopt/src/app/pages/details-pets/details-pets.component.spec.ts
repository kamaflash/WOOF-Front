import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsPetsComponent } from './details-pets.component';

describe('DetailsPetsComponent', () => {
  let component: DetailsPetsComponent;
  let fixture: ComponentFixture<DetailsPetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsPetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
