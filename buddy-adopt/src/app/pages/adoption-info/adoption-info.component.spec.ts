import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdoptionInfoComponent } from './adoption-info.component';

describe('AdoptionInfoComponent', () => {
  let component: AdoptionInfoComponent;
  let fixture: ComponentFixture<AdoptionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdoptionInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdoptionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
