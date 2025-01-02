import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeVigileComponent } from './liste-vigile.component';

describe('ListeVigileComponent', () => {
  let component: ListeVigileComponent;
  let fixture: ComponentFixture<ListeVigileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeVigileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeVigileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
