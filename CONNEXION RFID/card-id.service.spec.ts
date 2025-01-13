import { TestBed } from '@angular/core/testing';

import { CardIdService } from './card-id.service';

describe('CardIdService', () => {
  let service: CardIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
