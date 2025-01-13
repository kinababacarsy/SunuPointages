import { TestBed } from '@angular/core/testing';

import { Websocket1Service } from './websocket1.service';

describe('Websocket1Service', () => {
  let service: Websocket1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Websocket1Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
