import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnexionVigileComponent } from './connexion-vigile.component';

describe('ConnexionVigileComponent', () => {
  let component: ConnexionVigileComponent;
  let fixture: ComponentFixture<ConnexionVigileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnexionVigileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnexionVigileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
