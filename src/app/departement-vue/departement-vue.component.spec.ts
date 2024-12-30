import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementVueComponent } from './departement-vue.component';

describe('DepartementVueComponent', () => {
  let component: DepartementVueComponent;
  let fixture: ComponentFixture<DepartementVueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementVueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartementVueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
