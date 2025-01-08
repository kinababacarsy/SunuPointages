import { TestBed } from '@angular/core/testing';

import { AssignationCarteService } from './assignation-carte.service';

describe('AssignationCarteService', () => {
  let service: AssignationCarteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignationCarteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
