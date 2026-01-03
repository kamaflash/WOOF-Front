import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestaddComponent } from './requestadd.component';

describe('RequestaddComponent', () => {
  let component: RequestaddComponent;
  let fixture: ComponentFixture<RequestaddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestaddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestaddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
