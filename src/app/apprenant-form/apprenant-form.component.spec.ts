import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantFormComponent } from './apprenant-form.component';

describe('ApprenantFormComponent', () => {
  let component: ApprenantFormComponent;
  let fixture: ComponentFixture<ApprenantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
