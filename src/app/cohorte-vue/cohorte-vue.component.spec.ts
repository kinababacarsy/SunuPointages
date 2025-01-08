import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohorteVueComponent } from './cohorte-vue.component';

describe('CohorteVueComponent', () => {
  let component: CohorteVueComponent;
  let fixture: ComponentFixture<CohorteVueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CohorteVueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohorteVueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
