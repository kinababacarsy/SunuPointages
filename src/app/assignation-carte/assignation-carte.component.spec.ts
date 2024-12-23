import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignationCarteComponent } from './assignation-carte.component';

describe('AssignationCarteComponent', () => {
  let component: AssignationCarteComponent;
  let fixture: ComponentFixture<AssignationCarteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignationCarteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignationCarteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
