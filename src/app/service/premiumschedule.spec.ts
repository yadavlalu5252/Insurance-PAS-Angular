import { TestBed } from '@angular/core/testing';

import { Premiumschedule } from './premiumschedule';

describe('Premiumschedule', () => {
  let service: Premiumschedule;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Premiumschedule);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
